import type { L2DEventMap, Options } from './types.js';
import Cubism2Model from './cubism2/index.js';
import { AppDelegate as Cubism6Model } from './cubism6/index.js';
import { Emitter } from './emitter.js';
import { HitAreaOverlay } from './hit-area-overlay.js';
import logger from './logger.js';
import { checkModelVersion } from './utils/model.js';

class L2D extends Emitter<L2DEventMap> {
  private canvas: HTMLCanvasElement;
  private l2d2Model: Cubism2Model | null = null;
  private l2d6Model: Cubism6Model | null = null;
  private currentVersion: number | null = null;
  private hitAreaOverlay: HitAreaOverlay;

  constructor(canvas: HTMLCanvasElement) {
    super();
    this.canvas = canvas;
    this.hitAreaOverlay = new HitAreaOverlay(canvas, () => {
      return this.currentVersion === 2
        ? (this.l2d2Model?.getHitAreaBounds() ?? [])
        : (this.l2d6Model?.getHitAreaBounds() ?? []);
    });
    this._on('live2d:motionstart', d => this.emit('motionstart', d.group, d.index, d.duration ?? null));
    this._on('live2d:expressionstart', d => this.emit('expressionstart', d.id));
    this._on('live2d:expressionend', () => this.emit('expressionend'));
    this._on('live2d:loadstart', d => this.emit('loadstart', d.total));
    this._on('live2d:loadprogress', d => this.emit('loadprogress', d.loaded, d.total, d.file));
    this._on('live2d:tapbody', d => this.emit('tap', d.areaName ?? ''));
    this._on('live2d:motionend', d => this.emit('motionend', d.group, d.index));
  }

  private _on(type: string, handler: (detail: any) => void) {
    window.addEventListener(type, (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.canvas === this.canvas)
        handler(detail);
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
        : (this.l2d6Model?.getHitAreaBounds() ?? []);
    });
  }

  /**
   * 加载并渲染一个 Live2D 模型，自动识别 Cubism 2 / 6 版本。
   * 版本切换时会自动替换 canvas 以规避 WebGL context 不兼容问题。
   * 加载完成后触发 `loaded` 事件。
   * @param options - 模型加载选项，参见 {@link Options}
   */
  async load(options: Options): Promise<void> {
    const prevVersion = this.currentVersion;

    // 清理旧模型
    if (this.l2d2Model) {
      this.l2d2Model.destroy();
      this.l2d2Model = null;
    }
    if (this.l2d6Model) {
      this.l2d6Model.release();
      this.l2d6Model = null;
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
      const model = new Cubism6Model(this.canvas);
      this.l2d6Model = model;
      if (!model.initialize()) {
        console.error('Failed to initialize Cubism6 model');
        return;
      }
      if (options.position)
        model.setPosition(options.position[0], options.position[1]);
      model.changeModel(options.path);
      model.run();
      await new Promise<void>(resolve => {
        model.onLoaded(() => {
          this.resize();
          const scale6 = this._resolveScale(options.scale, version);
          model.setScale(scale6);
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
    // Cubism 3+ (Cubism6) view X: ±(w/h), Y: ±1 — portrait causes horizontal overflow
    // Cubism2 view X: ±1, Y: ±(h/w) — landscape causes vertical overflow
    return version !== 2
      ? Math.min(1, w / h)
      : Math.min(1, h / w);
  }

  /**
   * @deprecated 请使用 {@link load} 代替
   */
  create(options: Options) {
    return this.load(options);
  }

  /**
   * 通知模型重新计算渲染尺寸以适配当前 canvas 大小。
   *
   * 当 canvas 的 `width` / `height` 属性发生变化后调用此方法，使模型填满新尺寸。
   */
  resize() {
    if (this.currentVersion === 2 && this.l2d2Model) {
      this.l2d2Model.resize();
    }
    else if (this.currentVersion !== null && this.l2d6Model) {
      this.l2d6Model.resize();
    }
  }

  /**
   * 对整个画布应用 CSS 旋转变换。
   *
   * 此旋转为 CSS `transform: rotate()` 层面的 2D 变换，不影响模型骨骼或物理演算。
   * Hit area 检测区域会同步跟随旋转。
   *
   * @param deg - 旋转角度（度），正值为顺时针，`0` 清除旋转
   */
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

  /**
   * 显示或隐藏 hit area 的可视化边界框，用于调试可交互区域。
   *
   * @param enabled - `true` 显示边界框，`false` 隐藏
   */
  showHitAreas(enabled: boolean) {
    if (enabled && !this._isReady('showHitAreas'))
      return;
    enabled ? this.hitAreaOverlay.show() : this.hitAreaOverlay.hide();
  }

  /**
   * 播放指定动作组中的动作。
   * @param group - 动作组名称
   * @param index - 组内动作索引，省略时随机播放
   * @param priority - 播放优先级，数值越大越优先
   */
  playMotion(group: string, index?: number, priority?: number) {
    if (!this._isReady('playMotion'))
      return;
    if (this.currentVersion === 2)
      this.l2d2Model!.playMotion(group, index, priority);
    else
      this.l2d6Model!.playMotion(group, index, priority);
  }

  /** 获取所有动作组及其动作数量的映射，`{ 组名: 动作数 }` */
  getMotionGroups(): Record<string, number> {
    if (!this._isReady('getMotionGroups'))
      return {};
    return this.currentVersion === 2
      ? this.l2d2Model!.getMotionGroups()
      : this.l2d6Model!.getMotionGroups();
  }

  /**
   * 获取所有动作文件路径，结构为 `{ 组名: [文件路径, ...] }`。
   * 可用于配合 {@link playMotionByFile} 按文件路径播放动作。
   */
  getMotionFiles(): Record<string, string[]> {
    if (!this._isReady('getMotionFiles'))
      return {};
    return this.currentVersion === 2
      ? this.l2d2Model!.getMotionFiles()
      : this.l2d6Model!.getMotionFiles();
  }

  /**
   * 通过动作文件路径播放动作，内部自动匹配对应的动作组和索引。
   * @param file - 动作文件路径，如 `'motions/idle.motion3.json'`
   * @param priority - 播放优先级
   */
  playMotionByFile(file: string, priority?: number) {
    const motionFiles = this.getMotionFiles();
    for (const [group, files] of Object.entries(motionFiles)) {
      const index = files.findIndex(f => f === file || f.startsWith(`${file}.`));
      if (index !== -1) {
        this.playMotion(group, index, priority);
        return;
      }
    }
  }

  /** 获取所有可用表情的 ID 列表 */
  getExpressions(): string[] {
    if (!this._isReady('getExpressions'))
      return [];
    return this.currentVersion === 2
      ? this.l2d2Model!.getExpressions()
      : this.l2d6Model!.getExpressions();
  }

  /**
   * 切换模型表情。
   * @param id - 表情 ID，省略时随机切换
   */
  setExpression(id?: string) {
    if (!this._isReady('setExpression'))
      return;
    if (this.currentVersion === 2)
      this.l2d2Model!.setExpression(id);
    else
      this.l2d6Model!.setExpression(id);
  }

  /**
   * 销毁当前模型并释放 WebGL 资源，清空画布。
   * 画布 DOM 节点本身不会被移除。
   */
  destroy() {
    if (this.l2d2Model) {
      this.l2d2Model.destroy();
      this.l2d2Model = null;
    }
    if (this.l2d6Model) {
      this.l2d6Model.release();
      this.l2d6Model = null;
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
