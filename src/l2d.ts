import type { L2DEventMap, Options } from './types.js';
import Cubism2Model from './cubism2/index.js';
import { AppDelegate as Cubism5Model } from './cubism5/index.js';
import { checkModelVersion } from './utils/model.js';

class L2D {
  private canvas: HTMLCanvasElement;
  private l2d2Model: Cubism2Model;
  private l2d5Model: Cubism5Model;
  private currentVersion: number | null = null;
  private _listeners: { [K in keyof L2DEventMap]?: L2DEventMap[K][] } = {};

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.l2d2Model = new Cubism2Model(this.canvas);
    this.l2d5Model = new Cubism5Model(this.canvas);
    window.addEventListener('live2d:tapbody', () => this._emit('tap'));
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
      await this.l2d2Model.init(this.canvas, options.path, result);
      if (options.position) {
        this.l2d2Model.setPosition(options.position[0], options.position[1]);
      }
      if (options.scale) {
        this.l2d2Model.setScale(options.scale);
      }
      this.resize(options.width ?? 300, options.height ?? 300);
      this._emit('loaded');
    }
    else {
      // 初始化 Cubism5 模型
      if (!this.l2d5Model.initialize()) {
        console.error('Failed to initialize Cubism5 model');
        return;
      }
      if (options.position) {
        this.l2d5Model.setPosition(options.position[0], options.position[1]);
      }
      if (options.scale) {
        this.l2d5Model.setScale(options.scale);
      }
      this.l2d5Model.changeModel(options.path);
      this.l2d5Model.run();
      await new Promise<void>(resolve => {
        this.l2d5Model.onLoaded(() => {
          this.resize(options.width ?? 300, options.height ?? 300);
          this._emit('loaded');
          resolve();
        });
      });
    }
  }

  resize(width: number, height: number) {
    if (this.currentVersion === 2) {
      this.l2d2Model.resize(width, height);
    }
    else if (this.currentVersion !== null) {
      this.l2d5Model.resize(width, height);
    }
    else {
      // 模型尚未加载，只更新 canvas 尺寸
      this.canvas.width = width;
      this.canvas.height = height;
      this.canvas.style.width = `${width}px`;
      this.canvas.style.height = `${height}px`;
    }
  }
}

export default L2D;
