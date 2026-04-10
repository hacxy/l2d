import type { ModelState } from './motion-controller.js';
import type { L2DEventMap, Options } from './types.js';
import { cloneCanvas } from './canvas-manager.js';
import { EVENTS } from './const.js';
import { Emitter } from './emitter.js';
import { ExpressionController } from './expression-controller.js';
import logger from './logger.js';
import { loadModel } from './model-loader.js';
import { MotionController } from './motion-controller.js';

class L2D extends Emitter<L2DEventMap> {
  private canvas: HTMLCanvasElement;
  private _state: ModelState = { currentVersion: null, l2d2Model: null, l2d6Model: null };
  private _motionCtrl = new MotionController(this._state);
  private _exprCtrl = new ExpressionController(this._state);

  constructor(canvas: HTMLCanvasElement) {
    super();
    this.canvas = canvas;
    this._on(EVENTS.MOTION_START, d => this.emit('motionstart', d.group, d.index, d.duration ?? null, d.file ?? null));
    this._on(EVENTS.EXPRESSION_START, d => this.emit('expressionstart', d.id));
    this._on(EVENTS.EXPRESSION_END, () => this.emit('expressionend'));
    this._on(EVENTS.LOAD_START, d => this.emit('loadstart', d.total));
    this._on(EVENTS.LOAD_PROGRESS, d => this.emit('loadprogress', d.loaded, d.total, d.file));
    this._on(EVENTS.TAP_BODY, d => this.emit('tap', d.areaName ?? ''));
    this._on(EVENTS.MOTION_END, d => this.emit('motionend', d.group, d.index, d.file ?? null));
  }

  private _on(type: string, handler: (detail: any) => void) {
    window.addEventListener(type, (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.canvas === this.canvas)
        handler(detail);
    });
  }

  private _replaceCanvas() {
    this.canvas = cloneCanvas(this.canvas);
  }

  /**
   * 加载并渲染一个 Live2D 模型，自动识别 Cubism 2 / 6 版本。
   * 版本切换时会自动替换 canvas 以规避 WebGL context 不兼容问题。
   * 加载完成后触发 `loaded` 事件。
   * @param options - 模型加载选项，参见 {@link Options}
   */
  load(options: Options): Promise<void> {
    logger.setLevel(options.logLevel);
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

  resize() {
    if (this._state.currentVersion === 2 && this._state.l2d2Model)
      this._state.l2d2Model.resize();
    else if (this._state.currentVersion !== null && this._state.l2d6Model)
      this._state.l2d6Model.resize();
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

  /**
   * 获取所有动作，结构为 `{ 组名: [文件路径, ...] }`。
   * 可用于配合 {@link playMotionByFile} 按文件路径播放动作。
   */
  getMotions(): Record<string, string[]> {
    return this._motionCtrl.getMotions();
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
   * 设置模型在画布中的位置偏移，与加载选项中的 `position` 作用一致。
   * @param x - X 轴偏移
   * @param y - Y 轴偏移
   */
  setPosition(x: number, y: number) {
    if (this._state.currentVersion === 2 && this._state.l2d2Model)
      this._state.l2d2Model.setPosition(x, y);
    else if (this._state.currentVersion !== null && this._state.l2d6Model)
      this._state.l2d6Model.setPosition(x, y);
  }

  /**
   * 批量设置模型参数值，参数 ID 可在模型的 `.cdi3.json` 文件中查看。
   * 注意：SDK 内部的动画（呼吸、眨眼等）每帧都会更新参数，若需持续锁定需每帧调用。
   * @example l2d.setParams({ ParamEyeLOpen: 0, ParamA: 1 })
   */
  setParams(params: Record<string, number>) {
    if (this._state.currentVersion === 2 && this._state.l2d2Model)
      this._state.l2d2Model.setParams(params);
    else if (this._state.currentVersion !== null && this._state.l2d6Model)
      this._state.l2d6Model.setParams(params);
  }

  /**
   * 获取所有 hit area 的当前归一化边界（相对 canvas 的 0~1 比例）。
   * 每帧调用可实现实时追踪。
   * @example
   * // canvas overlay
   * ctx.strokeRect(b.x * canvas.width, b.y * canvas.height, b.w * canvas.width, b.h * canvas.height)
   * // div overlay
   * el.style.left = `${b.x * 100}%`
   */
  getHitAreaBounds(): Array<{ name: string, x: number, y: number, w: number, h: number }> {
    const raw = this._state.currentVersion === 2 && this._state.l2d2Model
      ? this._state.l2d2Model.getHitAreaBounds()
      : this._state.currentVersion !== null && this._state.l2d6Model
        ? this._state.l2d6Model.getHitAreaBounds()
        : [];
    const { width, height } = this.canvas;
    return raw.map(b => ({
      name: b.name,
      x: b.x / width,
      y: b.y / height,
      w: b.w / width,
      h: b.h / height,
    }));
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
    const gl = this.canvas.getContext('webgl2') ?? this.canvas.getContext('webgl') as WebGL2RenderingContext | null;
    if (gl) {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    }
    this.emit('destroy');
  }
}

export default L2D;
