import type { HitAreaOverlay } from './hit-area-overlay.js';
import type { ModelState } from './motion-controller.js';
import type { L2DEventMap, Options } from './types.js';
import { cloneCanvas, createHitAreaOverlay } from './canvas-manager.js';
import { EVENTS } from './const.js';
import { Emitter } from './emitter.js';
import { ExpressionController } from './expression-controller.js';
import logger from './logger.js';
import { loadModel } from './model-loader.js';
import { MotionController } from './motion-controller.js';

class L2D extends Emitter<L2DEventMap> {
  private canvas: HTMLCanvasElement;
  private hitAreaOverlay: HitAreaOverlay;
  private _state: ModelState = { currentVersion: null, l2d2Model: null, l2d6Model: null };
  private _motionCtrl = new MotionController(this._state);
  private _exprCtrl = new ExpressionController(this._state);

  constructor(canvas: HTMLCanvasElement) {
    super();
    this.canvas = canvas;
    this.hitAreaOverlay = createHitAreaOverlay(canvas, this._state);
    this._on(EVENTS.MOTION_START, d => this.emit('motionstart', d.group, d.index, d.duration ?? null));
    this._on(EVENTS.EXPRESSION_START, d => this.emit('expressionstart', d.id));
    this._on(EVENTS.EXPRESSION_END, () => this.emit('expressionend'));
    this._on(EVENTS.LOAD_START, d => this.emit('loadstart', d.total));
    this._on(EVENTS.LOAD_PROGRESS, d => this.emit('loadprogress', d.loaded, d.total, d.file));
    this._on(EVENTS.TAP_BODY, d => this.emit('tap', d.areaName ?? ''));
    this._on(EVENTS.MOTION_END, d => this.emit('motionend', d.group, d.index));
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
    this.canvas = cloneCanvas(this.canvas);
    this.hitAreaOverlay = createHitAreaOverlay(this.canvas, this._state);
  }

  /**
   * 加载并渲染一个 Live2D 模型，自动识别 Cubism 2 / 6 版本。
   * 版本切换时会自动替换 canvas 以规避 WebGL context 不兼容问题。
   * 加载完成后触发 `loaded` 事件。
   * @param options - 模型加载选项，参见 {@link Options}
   */
  load(options: Options): Promise<void> {
    return loadModel({
      canvas: this.canvas,
      state: this._state,
      resize: () => this.resize(),
      emit: () => this.emit('loaded'),
      replaceCanvas: () => this._replaceCanvas(),
    }, options);
  }

  /** @deprecated 请使用 {@link load} 代替 */
  create(options: Options) {
    return this.load(options);
  }

  /**
   * 通知模型重新计算渲染尺寸以适配当前 canvas 大小。
   *
   * 当 canvas 的 `width` / `height` 属性发生变化后调用此方法，使模型填满新尺寸。
   */
  resize() {
    if (this._state.currentVersion === 2 && this._state.l2d2Model)
      this._state.l2d2Model.resize();
    else if (this._state.currentVersion !== null && this._state.l2d6Model)
      this._state.l2d6Model.resize();
  }

  /**
   * 显示或隐藏 hit area 的可视化边界框，用于调试可交互区域。
   * @param enabled - `true` 显示边界框，`false` 隐藏
   */
  showHitAreas(enabled: boolean) {
    if (enabled && this._state.currentVersion === null) {
      logger.warn('showHitAreas: 模型尚未加载完成，请在 loaded 事件触发后调用。');
      return;
    }
    enabled ? this.hitAreaOverlay.show() : this.hitAreaOverlay.hide();
  }

  /**
   * 播放指定动作组中的动作。
   * @param group - 动作组名称
   * @param index - 组内动作索引，省略时随机播放
   * @param priority - 播放优先级，数值越大越优先
   */
  playMotion(group: string, index?: number, priority?: number) {
    this._motionCtrl.playMotion(group, index, priority);
  }

  /** 获取所有动作组及其动作数量的映射，`{ 组名: 动作数 }` */
  getMotionGroups(): Record<string, number> {
    return this._motionCtrl.getMotionGroups();
  }

  /**
   * 获取所有动作文件路径，结构为 `{ 组名: [文件路径, ...] }`。
   * 可用于配合 {@link playMotionByFile} 按文件路径播放动作。
   */
  getMotionFiles(): Record<string, string[]> {
    return this._motionCtrl.getMotionFiles();
  }

  /**
   * 通过动作文件路径播放动作，内部自动匹配对应的动作组和索引。
   * @param file - 动作文件路径，如 `'motions/idle.motion3.json'`
   * @param priority - 播放优先级
   */
  playMotionByFile(file: string, priority?: number) {
    this._motionCtrl.playMotionByFile(file, priority);
  }

  /** 获取所有可用表情的 ID 列表 */
  getExpressions(): string[] {
    return this._exprCtrl.getExpressions();
  }

  /**
   * 切换模型表情。
   * @param id - 表情 ID，省略时随机切换
   */
  setExpression(id?: string) {
    this._exprCtrl.setExpression(id);
  }

  /**
   * 设置模型缩放比例，与加载选项中的 `scale` 作用一致。
   * @param scale - 缩放比例，`1` 为原始大小
   */
  setScale(scale: number) {
    if (this._state.currentVersion === 2 && this._state.l2d2Model)
      this._state.l2d2Model.setScale(scale);
    else if (this._state.currentVersion !== null && this._state.l2d6Model)
      this._state.l2d6Model.setScale(scale);
  }

  /**
   * 销毁当前模型并释放 WebGL 资源，清空画布。
   * 画布 DOM 节点本身不会被移除。
   */
  destroy() {
    if (this._state.l2d2Model) {
      this._state.l2d2Model.destroy();
      this._state.l2d2Model = null;
    }
    if (this._state.l2d6Model) {
      this._state.l2d6Model.release();
      this._state.l2d6Model = null;
    }
    this._state.currentVersion = null;
    this.hitAreaOverlay.hide();
    const gl = this.canvas.getContext('webgl2');
    if (gl) {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
  }
}

export default L2D;
