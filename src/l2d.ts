import type { L2DEventMap, LoadingOverlayOptions, Options } from './types.js';
import Cubism2Model from './cubism2/index.js';
import { AppDelegate as Cubism5Model } from './cubism5/index.js';
import { Emitter } from './emitter.js';
import { HitAreaOverlay } from './hit-area-overlay.js';
import { LoadingOverlay } from './loading-overlay.js';
import logger from './logger.js';
import { checkModelVersion } from './utils/model.js';

class L2D extends Emitter<L2DEventMap> {
  private canvas: HTMLCanvasElement;
  private l2d2Model: Cubism2Model | null = null;
  private l2d5Model: Cubism5Model | null = null;
  private currentVersion: number | null = null;
  private hitAreaOverlay: HitAreaOverlay;
  private loadingOverlay: LoadingOverlay;
  private _loadingEnabled = true;
  private _loadingOpts: LoadingOverlayOptions | null = null;

  constructor(canvas: HTMLCanvasElement) {
    super();
    this.canvas = canvas;
    this.hitAreaOverlay = new HitAreaOverlay(canvas, () => {
      return this.currentVersion === 2
        ? (this.l2d2Model?.getHitAreaBounds() ?? [])
        : (this.l2d5Model?.getHitAreaBounds() ?? []);
    });
    this.loadingOverlay = new LoadingOverlay(canvas);
    window.addEventListener('live2d:loadstart', (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.canvas === this.canvas && this._loadingEnabled)
        this.loadingOverlay.show(detail.total, this._loadingOpts ?? void 0);
    });
    window.addEventListener('live2d:loadprogress', (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.canvas === this.canvas)
        this.loadingOverlay.progress(detail.loaded, detail.total, detail.file);
    });
    window.addEventListener('live2d:loaded', (e: Event) => {
      if ((e as CustomEvent).detail?.canvas === this.canvas)
        this.loadingOverlay.hide();
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

  async load(options: Options): Promise<void> {
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

    this._loadingEnabled = options.loading !== false;
    this._loadingOpts = typeof options.loading === 'object' ? options.loading : null;
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
      if (options.position)
        model.setPosition(options.position[0], options.position[1]);
      this.resize(options.width ?? 300, options.height ?? 300);
      const scale2 = this._resolveScale(options.scale, 2);
      model.setScale(scale2);
      if (options.rotation)
        this.setRotation(options.rotation);
      this.emit('loaded');
      window.dispatchEvent(new CustomEvent('live2d:loaded', { detail: { canvas: this.canvas } }));
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
          this.resize(options.width ?? 300, options.height ?? 300);
          const scale5 = this._resolveScale(options.scale, 5);
          model.setScale(scale5);
          if (options.rotation)
            this.setRotation(options.rotation);
          this.emit('loaded');
          window.dispatchEvent(new CustomEvent('live2d:loaded', { detail: { canvas: this.canvas } }));
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

  setRotation(deg: number) {
    this.canvas.style.transform = deg === 0 ? '' : `rotate(${deg}deg)`;
    this.hitAreaOverlay.syncTransform(this.canvas.style.transform);
  }

  showHitAreas(enabled: boolean) {
    if (enabled && this.currentVersion === null) {
      logger.warn('showHitAreas: 模型尚未加载完成，请在 loaded 事件触发后调用。');
      return;
    }
    enabled ? this.hitAreaOverlay.show() : this.hitAreaOverlay.hide();
  }
}

export default L2D;
