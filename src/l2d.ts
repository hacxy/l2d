import type { L2DEventMap, Options } from './types.js';
import Cubism2Model from './cubism2/index.js';
import { AppDelegate as Cubism5Model } from './cubism5/index.js';
import { checkModelVersion } from './utils/model.js';

class L2D {
  private canvas: HTMLCanvasElement;
  private l2d2Model: Cubism2Model | null = null;
  private l2d5Model: Cubism5Model | null = null;
  private currentVersion: number | null = null;
  private _listeners: { [K in keyof L2DEventMap]?: L2DEventMap[K][] } = {};
  private _hitAreaOverlay: HTMLCanvasElement | null = null;
  private _hitAreaRAF: number | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    window.addEventListener('live2d:tapbody', (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.canvas === this.canvas) {
        this._emit('tap', detail.areaName ?? '');
      }
    });
  }

  on<K extends keyof L2DEventMap>(event: K, listener: L2DEventMap[K]) {
    if (!this._listeners[event]) {
      this._listeners[event] = [];
    }
    (this._listeners[event] as L2DEventMap[K][]).push(listener);
    return this;
  }

  private _emit<K extends keyof L2DEventMap>(event: K, ...args: Parameters<L2DEventMap[K]>) {
    this._listeners[event]?.forEach(fn => (fn as (...a: typeof args) => void)(...args));
  }

  async create(options: Options): Promise<void> {
    const res = await fetch(options.path);
    if (!res.ok) {
      console.error(`获取模型配置失败: ${res.statusText}`);
      return;
    }
    const result = await res.json();
    const version = checkModelVersion(result);
    this.currentVersion = version;
    if (version === 2) {
      const model = new Cubism2Model(this.canvas);
      this.l2d2Model = model;
      await model.init(this.canvas, options.path, result);
      if (options.position) {
        model.setPosition(options.position[0], options.position[1]);
      }
      if (options.scale) {
        model.setScale(options.scale);
      }
      this.resize(options.width ?? 300, options.height ?? 300);
      if (options.rotation)
        this.setRotation(options.rotation);
      this._emit('loaded');
    }
    else {
      const model = new Cubism5Model(this.canvas);
      this.l2d5Model = model;
      if (!model.initialize()) {
        console.error('Failed to initialize Cubism5 model');
        return;
      }
      if (options.position) {
        model.setPosition(options.position[0], options.position[1]);
      }
      if (options.scale) {
        model.setScale(options.scale);
      }
      model.changeModel(options.path);
      model.run();
      await new Promise<void>(resolve => {
        model.onLoaded(() => {
          this.resize(options.width ?? 300, options.height ?? 300);
          if (options.rotation)
            this.setRotation(options.rotation);
          this._emit('loaded');
          resolve();
        });
      });
    }
  }

  setRotation(deg: number) {
    this.canvas.style.transform = deg === 0 ? '' : `rotate(${deg}deg)`;
    if (this._hitAreaOverlay) {
      this._hitAreaOverlay.style.transform = this.canvas.style.transform;
    }
  }

  resize(width: number, height: number) {
    if (this.currentVersion === 2 && this.l2d2Model) {
      this.l2d2Model.resize(width, height);
    }
    else if (this.currentVersion !== null && this.l2d5Model) {
      this.l2d5Model.resize(width, height);
    }
    else {
      this.canvas.width = width;
      this.canvas.height = height;
      this.canvas.style.width = `${width}px`;
      this.canvas.style.height = `${height}px`;
    }
  }

  showHitAreas(enabled: boolean) {
    if (!enabled) {
      this._hitAreaOverlay?.remove();
      this._hitAreaOverlay = null;
      if (this._hitAreaRAF !== null) {
        cancelAnimationFrame(this._hitAreaRAF);
        this._hitAreaRAF = null;
      }
      return;
    }

    const overlay = document.createElement('canvas');
    overlay.style.cssText = 'position:absolute;pointer-events:none;';
    overlay.width = this.canvas.width;
    overlay.height = this.canvas.height;
    overlay.style.width = this.canvas.style.width;
    overlay.style.height = this.canvas.style.height;
    overlay.style.top = `${this.canvas.offsetTop}px`;
    overlay.style.left = `${this.canvas.offsetLeft}px`;
    if (this.canvas.style.transform) {
      overlay.style.transform = this.canvas.style.transform;
    }
    this.canvas.insertAdjacentElement('afterend', overlay);
    this._hitAreaOverlay = overlay;

    const ctx = overlay.getContext('2d')!;

    const draw = () => {
      ctx.clearRect(0, 0, overlay.width, overlay.height);

      const bounds = this.currentVersion === 2
        ? (this.l2d2Model?.getHitAreaBounds() ?? [])
        : (this.l2d5Model?.getHitAreaBounds() ?? []);

      for (const b of bounds) {
        ctx.strokeStyle = 'rgba(0,255,0,0.9)';
        ctx.lineWidth = 2;
        ctx.strokeRect(b.x, b.y, b.w, b.h);
        ctx.fillStyle = 'rgba(0,255,0,0.15)';
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.fillStyle = 'rgba(0,255,0,1)';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(b.name, b.x + 4, b.y + 14);
      }

      this._hitAreaRAF = requestAnimationFrame(draw);
    };
    draw();
  }
}

export default L2D;
