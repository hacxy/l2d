import type { L2DEventMap, Options } from './types.js';
import Cubism2Model from './cubism2/index.js';
import { AppDelegate as Cubism5Model } from './cubism5/index.js';
import { Emitter } from './emitter.js';
import { HitAreaOverlay } from './hit-area-overlay.js';
import logger from './logger.js';
import { checkModelVersion } from './utils/model.js';

class L2D extends Emitter<L2DEventMap> {
  private canvas: HTMLCanvasElement;
  private l2d2Model: Cubism2Model | null = null;
  private l2d5Model: Cubism5Model | null = null;
  private currentVersion: number | null = null;
  private hitAreaOverlay: HitAreaOverlay;

  constructor(canvas: HTMLCanvasElement) {
    super();
    this.canvas = canvas;
    this.hitAreaOverlay = new HitAreaOverlay(canvas, () => {
      return this.currentVersion === 2
        ? (this.l2d2Model?.getHitAreaBounds() ?? [])
        : (this.l2d5Model?.getHitAreaBounds() ?? []);
    });
    window.addEventListener('live2d:motionstart', (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.canvas === this.canvas)
        this.emit('motionstart', detail.group, detail.index);
    });
    window.addEventListener('live2d:loadstart', (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.canvas === this.canvas)
        this.emit('loadstart', detail.total);
    });
    window.addEventListener('live2d:loadprogress', (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.canvas === this.canvas)
        this.emit('loadprogress', detail.loaded, detail.total, detail.file);
    });
    window.addEventListener('live2d:modelfileloaded', (e: Event) => {
      if ((e as CustomEvent).detail?.canvas === this.canvas)
        this.emit('modelfileloaded');
    });
    window.addEventListener('live2d:texturesloaded', (e: Event) => {
      if ((e as CustomEvent).detail?.canvas === this.canvas)
        this.emit('texturesloaded');
    });
    window.addEventListener('live2d:tapbody', (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.canvas === this.canvas)
        this.emit('tap', detail.areaName ?? '');
    });
    window.addEventListener('live2d:hoverbody', (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.canvas === this.canvas)
        this.emit('hover', detail.areaName ?? '');
    });
  }

  private _replaceCanvas() {
    this.hitAreaOverlay.hide();
    const old = this.canvas;
    const next = document.createElement('canvas');
    next.id = old.id;
    next.className = old.className;
    next.style.cssText = old.style.cssText;
    next.width = old.width;
    next.height = old.height;
    old.parentNode?.replaceChild(next, old);
    this.canvas = next;
    this.hitAreaOverlay = new HitAreaOverlay(next, () => {
      return this.currentVersion === 2
        ? (this.l2d2Model?.getHitAreaBounds() ?? [])
        : (this.l2d5Model?.getHitAreaBounds() ?? []);
    });
  }

  async load(options: Options): Promise<void> {
    const prevVersion = this.currentVersion;

    // 清理旧模型
    if (this.l2d2Model) {
      this.l2d2Model.destroy();
      this.l2d2Model = null;
    }
    if (this.l2d5Model) {
      this.l2d5Model.release();
      this.l2d5Model = null;
    }
    this.currentVersion = null;

    const res = await fetch(options.path);
    if (!res.ok) {
      console.error(`获取模型配置失败: ${res.statusText}`);
      return;
    }
    const result = await res.json();
    const version = checkModelVersion(result);

    // 框架版本切换时 canvas 的 WebGL context attributes 不兼容，需替换 canvas
    if (prevVersion !== null && prevVersion !== version)
      this._replaceCanvas();

    this.currentVersion = version;

    if (version === 2) {
      const model = new Cubism2Model(this.canvas);
      this.l2d2Model = model;
      await model.init(this.canvas, options.path, result);
      if (options.position)
        model.setPosition(options.position[0], options.position[1]);
      this.resize();
      const scale2 = this._resolveScale(options.scale, 2);
      model.setScale(scale2);
      if (options.rotation)
        this.setRotation(options.rotation);
      this.emit('loaded');
    }
    else {
      const model = new Cubism5Model(this.canvas);
      this.l2d5Model = model;
      if (!model.initialize()) {
        console.error('Failed to initialize Cubism5 model');
        return;
      }
      if (options.position)
        model.setPosition(options.position[0], options.position[1]);
      model.changeModel(options.path);
      model.run();
      await new Promise<void>(resolve => {
        model.onLoaded(() => {
          this.resize();
          const scale5 = this._resolveScale(options.scale, 5);
          model.setScale(scale5);
          if (options.rotation)
            this.setRotation(options.rotation);
          this.emit('loaded');
          resolve();
        });
      });
    }
  }

  private _resolveScale(scale: number | 'auto' | null | void, version: number): number {
    if (typeof scale === 'number')
      return scale;
    const w = this.canvas.width;
    const h = this.canvas.height;
    if (w === h)
      return 1;
    // Cubism5 view X: ±(w/h), Y: ±1 — portrait causes horizontal overflow
    // Cubism2 view X: ±1, Y: ±(h/w) — landscape causes vertical overflow
    return version === 5
      ? Math.min(1, w / h)
      : Math.min(1, h / w);
  }

  /** @deprecated 请使用 `load()` */
  create(options: Options) {
    return this.load(options);
  }

  resize() {
    if (this.currentVersion === 2 && this.l2d2Model) {
      this.l2d2Model.resize();
    }
    else if (this.currentVersion !== null && this.l2d5Model) {
      this.l2d5Model.resize();
    }
  }

  setRotation(deg: number) {
    this.canvas.style.transform = deg === 0 ? '' : `rotate(${deg}deg)`;
    this.hitAreaOverlay.syncTransform(this.canvas.style.transform);
  }

  private _isReady(method: string): boolean {
    if (this.currentVersion === null) {
      logger.warn(`${method}: 模型尚未加载完成，请在 loaded 事件触发后调用。`);
      return false;
    }
    return true;
  }

  showHitAreas(enabled: boolean) {
    if (enabled && !this._isReady('showHitAreas'))
      return;
    enabled ? this.hitAreaOverlay.show() : this.hitAreaOverlay.hide();
  }

  playMotion(group: string, index?: number, priority?: number) {
    if (!this._isReady('playMotion'))
      return;
    if (this.currentVersion === 2)
      this.l2d2Model!.playMotion(group, index, priority);
    else
      this.l2d5Model!.playMotion(group, index, priority);
  }

  getMotionGroups(): Record<string, number> {
    if (!this._isReady('getMotionGroups'))
      return {};
    return this.currentVersion === 2
      ? this.l2d2Model!.getMotionGroups()
      : this.l2d5Model!.getMotionGroups();
  }

  setExpression(id?: string) {
    if (!this._isReady('setExpression'))
      return;
    if (this.currentVersion === 2)
      this.l2d2Model!.setExpression(id);
    else
      this.l2d5Model!.setExpression(id);
  }

  getExpressions(): string[] {
    if (!this._isReady('getExpressions'))
      return [];
    return this.currentVersion === 2
      ? this.l2d2Model!.getExpressions()
      : this.l2d5Model!.getExpressions();
  }

  destroy() {
    if (this.l2d2Model) {
      this.l2d2Model.destroy();
      this.l2d2Model = null;
    }
    if (this.l2d5Model) {
      this.l2d5Model.release();
      this.l2d5Model = null;
    }
    this.currentVersion = null;
    this.hitAreaOverlay.hide();
    const gl = this.canvas.getContext('webgl2');
    if (gl) {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
  }
}

export default L2D;
