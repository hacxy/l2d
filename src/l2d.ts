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

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    window.addEventListener('live2d:tapbody', (e: Event) => {
      if ((e as CustomEvent).detail?.canvas === this.canvas) {
        this._emit('tap');
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

  private _emit<K extends keyof L2DEventMap>(event: K) {
    this._listeners[event]?.forEach(fn => (fn as () => void)());
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
          this._emit('loaded');
          resolve();
        });
      });
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
}

export default L2D;
