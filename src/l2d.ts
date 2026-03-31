import type { L2DEventMap, Options } from './types.js';
import Cubism2Model from './cubism2/index.js';
import { AppDelegate as Cubism5Model } from './cubism5/index.js';
import { Emitter } from './emitter.js';
import { HitAreaOverlay } from './hit-area-overlay.js';
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
      if (options.position)
        model.setPosition(options.position[0], options.position[1]);
      if (options.scale)
        model.setScale(options.scale);
      this.resize(options.width ?? 300, options.height ?? 300);
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
      if (options.scale)
        model.setScale(options.scale);
      model.changeModel(options.path);
      model.run();
      await new Promise<void>(resolve => {
        model.onLoaded(() => {
          this.resize(options.width ?? 300, options.height ?? 300);
          if (options.rotation)
            this.setRotation(options.rotation);
          this.emit('loaded');
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

  setRotation(deg: number) {
    this.canvas.style.transform = deg === 0 ? '' : `rotate(${deg}deg)`;
    this.hitAreaOverlay.syncTransform(this.canvas.style.transform);
  }

  showHitAreas(enabled: boolean) {
    enabled ? this.hitAreaOverlay.show() : this.hitAreaOverlay.hide();
  }
}

export default L2D;
