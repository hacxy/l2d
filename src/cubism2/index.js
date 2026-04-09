import { EVENTS } from '../const.js';
import logger from '../logger.js';
import LAppDefine from './LAppDefine.js';
import LAppLive2DManager from './LAppLive2DManager.js';
import { L2DMatrix44, L2DTargetPoint, L2DViewMatrix } from './Live2DFramework.js';
import MatrixStack from './utils/MatrixStack.js';

// Serialize all Cubism2 model loading to avoid conflicts with global state
// (Live2DFramework.platformManager and texCounter are module-level globals)
let _loadQueue = Promise.resolve();

function normalizePoint(x, y, x0, y0, w, h) {
  const dx = x - x0;
  const dy = y - y0;
  let targetX = 0; let targetY = 0;
  if (dx >= 0) {
    targetX = dx / (w - x0);
  }
  else {
    targetX = dx / x0;
  }
  if (dy >= 0) {
    targetY = dy / (h - y0);
  }
  else {
    targetY = dy / y0;
  }
  return {
    vx: targetX,
    vy: -targetY
  };
}
class Cubism2Model {
  constructor(canvas) {
    this.live2DMgr = new LAppLive2DManager(canvas);
    this.isDrawStart = false;
    this.gl = null;
    this.canvas = null;
    this.dragMgr = null;
    this.viewMatrix = null;
    this.projMatrix = null;
    this.deviceToScreen = null;
    this._boundMouseEvent = this.mouseEvent.bind(this);
    this._boundTouchEvent = this.touchEvent.bind(this);
  }

  initL2dCanvas(canvas) {
    this.canvas = canvas;
    if (!this.canvas) {
      logger.error('initL2dCanvas: canvas 元素无效');
      return;
    }
    if (this.canvas.addEventListener) {
      this.canvas.addEventListener('click', this._boundMouseEvent, false);
      document.addEventListener('mousemove', this._boundMouseEvent, false);
      document.addEventListener('mouseout', this._boundMouseEvent, false);
      this.canvas.addEventListener('contextmenu', this._boundMouseEvent, false);
      this.canvas.addEventListener('touchstart', this._boundTouchEvent, false);
      this.canvas.addEventListener('touchend', this._boundTouchEvent, false);
      this.canvas.addEventListener('touchmove', this._boundTouchEvent, false);
    }
    this._resizeObserver = new ResizeObserver(() => this.resize());
    this._resizeObserver.observe(this.canvas);
  }

  async init(canvas, modelSettingPath, modelSetting) {
    const doInit = async () => {
      this.initL2dCanvas(canvas);
      if (!this.canvas) {
        logger.error('canvas 元素无效');
        return;
      }
      const width = this.canvas.width;
      const height = this.canvas.height;
      this.dragMgr = new L2DTargetPoint();
      const ratio = height / width;
      const left = LAppDefine.VIEW_LOGICAL_LEFT;
      const right = LAppDefine.VIEW_LOGICAL_RIGHT;
      const bottom = -ratio;
      const top = ratio;
      this.viewMatrix = new L2DViewMatrix();
      this.viewMatrix.setScreenRect(left, right, bottom, top);
      this.viewMatrix.setMaxScreenRect(LAppDefine.VIEW_LOGICAL_MAX_LEFT, LAppDefine.VIEW_LOGICAL_MAX_RIGHT, LAppDefine.VIEW_LOGICAL_MAX_BOTTOM, LAppDefine.VIEW_LOGICAL_MAX_TOP);
      this.viewMatrix.setMaxScale(LAppDefine.VIEW_MAX_SCALE);
      this.viewMatrix.setMinScale(LAppDefine.VIEW_MIN_SCALE);
      this.projMatrix = new L2DMatrix44();
      this.projMatrix.multScale(1, width / height);
      this.deviceToScreen = new L2DMatrix44();
      this.deviceToScreen.multTranslate(-width / 2.0, -height / 2.0);
      this.deviceToScreen.multScale(2 / width, -2 / width);
      this.gl = this.canvas.getContext('webgl2', { premultipliedAlpha: true, preserveDrawingBuffer: true });
      if (!this.gl) {
        logger.error('Failed to create WebGL context.');
        return;
      }
      // Activate this model's PlatformManager and GL context right before loading
      this.live2DMgr.activatePlatformManager();
      Live2D.setGL(this.gl);
      this.live2DMgr.onLoadStart = (total) => window.dispatchEvent(new CustomEvent(EVENTS.LOAD_START, { detail: { canvas: this.canvas, total } }));
      this.live2DMgr.onProgress = (loaded, total, file) => window.dispatchEvent(new CustomEvent(EVENTS.LOAD_PROGRESS, { detail: { canvas: this.canvas, loaded, total, file } }));
      this.live2DMgr.onMotionStart = ({ group, index, duration, file }) => window.dispatchEvent(new CustomEvent(EVENTS.MOTION_START, { detail: { canvas: this.canvas, group, index, duration, file } }));
      this.live2DMgr.onMotionEnd = ({ group, index, file }) => window.dispatchEvent(new CustomEvent(EVENTS.MOTION_END, { detail: { canvas: this.canvas, group, index, file } }));
      this.live2DMgr.onExpressionStart = ({ id }) => window.dispatchEvent(new CustomEvent(EVENTS.EXPRESSION_START, { detail: { canvas: this.canvas, id } }));
      this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
      await this.changeModelWithJSON(modelSettingPath, modelSetting);
      this.startDraw();
    };
    // Chain onto the global queue so Cubism2 models load one at a time
    _loadQueue = _loadQueue.then(doInit).catch(err => logger.error(err));
    return _loadQueue;
  }

  destroy() {
    if (this.canvas) {
      this.canvas.removeEventListener('click', this._boundMouseEvent, false);
      document.removeEventListener('mousemove', this._boundMouseEvent, false);
      document.removeEventListener('mouseout', this._boundMouseEvent, false);
      this.canvas.removeEventListener('contextmenu', this._boundMouseEvent, false);
      this.canvas.removeEventListener('touchstart', this._boundTouchEvent, false);
      this.canvas.removeEventListener('touchend', this._boundTouchEvent, false);
      this.canvas.removeEventListener('touchmove', this._boundTouchEvent, false);
    }
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
    if (this._drawFrameId) {
      window.cancelAnimationFrame(this._drawFrameId);
      this._drawFrameId = null;
    }
    this.isDrawStart = false;
    if (this.live2DMgr && typeof this.live2DMgr.release === 'function') {
      this.live2DMgr.release();
    }
    if (this.gl) {
    }
    this.canvas = null;
    this.gl = null;
    this.dragMgr = null;
    this.viewMatrix = null;
    this.projMatrix = null;
    this.deviceToScreen = null;
  }

  startDraw() {
    if (!this.isDrawStart) {
      this.isDrawStart = true;
      const tick = () => {
        this.draw();
        this._drawFrameId = window.requestAnimationFrame(tick, this.canvas);
      };
      tick();
    }
  }

  draw() {
    MatrixStack.reset();
    MatrixStack.loadIdentity();
    this.dragMgr.update();
    this.live2DMgr.setDrag(this.dragMgr.getX(), this.dragMgr.getY());
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    MatrixStack.multMatrix(this.projMatrix.getArray());
    MatrixStack.multMatrix(this.viewMatrix.getArray());
    MatrixStack.push();
    const model = this.live2DMgr.getModel();
    if (model == null)
      return;
    if (model.initialized && !model.updating) {
      model.update();
      model.draw(this.gl);
    }
    MatrixStack.pop();

    // Detect expression end
    if (model?.expressionManager) {
      const finished = model.expressionManager.isFinished();
      if (!this._expressionWasPlaying && !finished) {
        this._expressionWasPlaying = true;
      }
      else if (this._expressionWasPlaying && finished) {
        this._expressionWasPlaying = false;
        window.dispatchEvent(new CustomEvent(EVENTS.EXPRESSION_END, { detail: { canvas: this.canvas } }));
      }
    }
  }

  async changeModel(modelSettingPath) {
    await this.live2DMgr.changeModel(this.gl, modelSettingPath);
  }

  async changeModelWithJSON(modelSettingPath, modelSetting) {
    await this.live2DMgr.changeModelWithJSON(this.gl, modelSettingPath, modelSetting);
  }

  setPosition(x, y) {
    this._userPosition = [x, y];
    const ratio = this.canvas.height / this.canvas.width;
    this.viewMatrix.translate(x * ratio, y * ratio);
  }

  setScale(scale) {
    this._userScale = scale;
    this._applyViewState();
  }

  setParams(params) {
    const model = this.live2DMgr.getModel();
    if (!model) return;
    model._forcedParams = { ...params };
  }

  _applyViewState() {
    const width = this.canvas.width;
    const height = this.canvas.height;
    const ratio = height / width;
    const left = LAppDefine.VIEW_LOGICAL_LEFT;
    const right = LAppDefine.VIEW_LOGICAL_RIGHT;
    this.viewMatrix = new L2DViewMatrix();
    this.viewMatrix.setScreenRect(left, right, -ratio, ratio);
    this.viewMatrix.setMaxScreenRect(LAppDefine.VIEW_LOGICAL_MAX_LEFT, LAppDefine.VIEW_LOGICAL_MAX_RIGHT, LAppDefine.VIEW_LOGICAL_MAX_BOTTOM, LAppDefine.VIEW_LOGICAL_MAX_TOP);
    this.viewMatrix.setMaxScale(LAppDefine.VIEW_MAX_SCALE);
    this.viewMatrix.setMinScale(LAppDefine.VIEW_MIN_SCALE);
    // Apply h/w as base scale so scale=1 fills canvas height, consistent with Cubism6
    this.viewMatrix.adjustScale(0, 0, (this._userScale ?? 1) * ratio);
    if (this._userPosition !== undefined) {
      this.viewMatrix.translate(this._userPosition[0] * ratio, this._userPosition[1] * ratio);
    }
  }

  resize() {
    if (!this.canvas || !this.gl) return;
    this.canvas.width = this.canvas.clientWidth * window.devicePixelRatio;
    this.canvas.height = this.canvas.clientHeight * window.devicePixelRatio;
    const width = this.canvas.width;
    const height = this.canvas.height;

    this._applyViewState();

    this.projMatrix = new L2DMatrix44();
    this.projMatrix.multScale(1, width / height);

    this.deviceToScreen = new L2DMatrix44();
    this.deviceToScreen.multTranslate(-width / 2.0, -height / 2.0);
    this.deviceToScreen.multScale(2 / width, -2 / width);

    this.gl.viewport(0, 0, width, height);
  }

  modelTurnHead(event) {
    const rect = this.canvas.getBoundingClientRect();
    const { vx, vy } = normalizePoint(event.clientX, event.clientY, rect.left + rect.width / 2, rect.top + rect.height / 2, window.innerWidth, window.innerHeight);
    logger.trace(`onMouseDown device( x:${
      event.clientX
    } y:${
      event.clientY
    } ) view( x:${
      vx
    } y:${
      vy
    })`);
    this.dragMgr.setPoint(vx, vy);
    const canvasX = (event.clientX - rect.left) * (this.canvas.width / rect.width);
    const canvasY = (event.clientY - rect.top) * (this.canvas.height / rect.height);
    const hx = this.transformViewX(canvasX);
    const hy = this.transformViewY(canvasY);
    const model = this.live2DMgr?.getModel();
    if (model) {
      const count = model.modelSetting?.getHitAreaNum() ?? 0;
      for (let i = 0; i < count; i++) {
        const areaName = model.modelSetting.getHitAreaName(i);
        if (model.hitTest(areaName, hx, hy)) {
          window.dispatchEvent(new CustomEvent(EVENTS.TAP_BODY, { detail: { canvas: this.canvas, areaName } }));
        }
      }
    }
  }

  followPointer(event) {
    const rect = this.canvas.getBoundingClientRect();
    const { vx, vy } = normalizePoint(event.clientX, event.clientY, rect.left + rect.width / 2, rect.top + rect.height / 2, window.innerWidth, window.innerHeight);
    logger.trace(`onMouseMove device( x:${
      event.clientX
    } y:${
      event.clientY
    } ) view( x:${
      vx
    } y:${
      vy
    })`);
    this.dragMgr.setPoint(vx, vy);
  }

  lookFront() {
    this.dragMgr.setPoint(0, 0);
  }

  mouseEvent(e) {
    e.preventDefault();
    if (e.type == 'click' || e.type == 'contextmenu') {
      this.modelTurnHead(e);
    }
    else if (e.type == 'mousemove') {
      this.followPointer(e);
    }
    else if (e.type == 'mouseout') {
      this.lookFront();
    }
  }

  touchEvent(e) {
    e.preventDefault();
    const touch = e.touches[0];
    if (e.type == 'touchstart') {
      if (e.touches.length == 1)
        this.modelTurnHead(touch);
    }
    else if (e.type == 'touchmove') {
      this.followPointer(touch);
    }
    else if (e.type == 'touchend') {
      this.lookFront();
    }
  }

  getHitAreaBounds() {
    if (!this.canvas || !this.viewMatrix) return [];
    const model = this.live2DMgr.getModel();
    if (!model || !model.initialized) return [];

    const setting = model.modelSetting;
    const count = setting.getHitAreaNum();
    const result = [];

    for (let i = 0; i < count; i++) {
      const name = setting.getHitAreaName(i);
      const drawID = setting.getHitAreaID(i);
      const drawIndex = model.live2DModel.getDrawDataIndex(drawID);
      if (drawIndex < 0) continue;

      const points = model.live2DModel.getTransformedPoints(drawIndex);
      if (!points || points.length === 0) continue;

      let left = points[0];
      let right = points[0];
      let top = points[1];
      let bottom = points[1];

      for (let j = 0; j < points.length; j += 2) {
        const x = points[j];
        const y = points[j + 1];
        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }

      // model local → view space → screen space → device (canvas pixel)
      const toDevice = (mx, my) => {
        const vx = model.modelMatrix.transformX(mx);
        const vy = model.modelMatrix.transformY(my);
        const sx = this.viewMatrix.transformX(vx);
        const sy = this.viewMatrix.transformY(vy);
        return {
          x: this.deviceToScreen.invertTransformX(sx),
          y: this.deviceToScreen.invertTransformY(sy),
        };
      };

      const tl = toDevice(left, top);
      const br = toDevice(right, bottom);

      result.push({
        name,
        x: Math.min(tl.x, br.x),
        y: Math.min(tl.y, br.y),
        w: Math.abs(br.x - tl.x),
        h: Math.abs(br.y - tl.y),
      });
    }
    return result;
  }

  playMotion(group, index, priority = LAppDefine.PRIORITY_NORMAL) {
    const model = this.live2DMgr.getModel();
    if (!model) return;
    if (index === undefined) {
      model.startRandomMotion(group, priority);
    }
    else {
      model.startMotion(group, index, priority);
    }
  }

  getMotionGroups() {
    const model = this.live2DMgr.getModel();
    if (!model?.modelSetting) return {};
    const motions = model.modelSetting.json[model.modelSetting.MOTION_GROUPS] ?? {};
    const result = {};
    for (const group of Object.keys(motions)) {
      result[group] = model.modelSetting.getMotionNum(group);
    }
    return result;
  }

  getMotionFiles() {
    const model = this.live2DMgr.getModel();
    if (!model?.modelSetting) return {};
    const motions = model.modelSetting.json[model.modelSetting.MOTION_GROUPS] ?? {};
    const result = {};
    for (const group of Object.keys(motions)) {
      const count = model.modelSetting.getMotionNum(group);
      result[group] = [];
      for (let i = 0; i < count; i++) {
        result[group].push(model.modelSetting.getMotionFile(group, i));
      }
    }
    return result;
  }

  setExpression(id) {
    const model = this.live2DMgr.getModel();
    if (!model) return;
    id ? model.setExpression(id) : model.setRandomExpression();
  }

  getExpressions() {
    const model = this.live2DMgr.getModel();
    if (!model?.modelSetting) return [];
    const result = [];
    for (let i = 0; i < model.modelSetting.getExpressionNum(); i++) {
      result.push(model.modelSetting.getExpressionName(i));
    }
    return result;
  }

  transformViewX(deviceX) {
    const screenX = this.deviceToScreen.transformX(deviceX);
    return this.viewMatrix.invertTransformX(screenX);
  }

  transformViewY(deviceY) {
    const screenY = this.deviceToScreen.transformY(deviceY);
    return this.viewMatrix.invertTransformY(screenY);
  }

  transformScreenX(deviceX) {
    return this.deviceToScreen.transformX(deviceX);
  }

  transformScreenY(deviceY) {
    return this.deviceToScreen.transformY(deviceY);
  }
}
export default Cubism2Model;
