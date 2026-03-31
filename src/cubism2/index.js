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
  }

  async changeModel(modelSettingPath) {
    await this.live2DMgr.changeModel(this.gl, modelSettingPath);
  }

  async changeModelWithJSON(modelSettingPath, modelSetting) {
    await this.live2DMgr.changeModelWithJSON(this.gl, modelSettingPath, modelSetting);
  }

  setPosition(x, y) {
    this._userPosition = [x, y];
    this.viewMatrix.translate(x, y);
  }

  setScale(scale) {
    this._userScale = scale;
    this.viewMatrix.adjustScale(0, 0, scale);
  }

  resize(width, height) {
    if (!this.canvas || !this.gl) return;
    this.canvas.width = width;
    this.canvas.height = height;

    const ratio = height / width;
    const left = LAppDefine.VIEW_LOGICAL_LEFT;
    const right = LAppDefine.VIEW_LOGICAL_RIGHT;
    const bottom = -ratio;
    const top = ratio;

    this.viewMatrix.setScreenRect(left, right, bottom, top);

    this.projMatrix = new L2DMatrix44();
    this.projMatrix.multScale(1, width / height);

    this.deviceToScreen = new L2DMatrix44();
    this.deviceToScreen.multTranslate(-width / 2.0, -height / 2.0);
    this.deviceToScreen.multScale(2 / width, -2 / width);

    this.gl.viewport(0, 0, width, height);

    if (this._userScale !== undefined) {
      this.viewMatrix.adjustScale(0, 0, this._userScale);
    }
    if (this._userPosition !== undefined) {
      this.viewMatrix.translate(this._userPosition[0], this._userPosition[1]);
    }
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
    this.live2DMgr.tapEvent(vx, vy);
    const model = this.live2DMgr?.getModel();
    if (model && model.hitTest(LAppDefine.HIT_AREA_BODY, vx, vy)) {
      window.dispatchEvent(new CustomEvent('live2d:tapbody', { detail: { canvas: this.canvas } }));
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
    const model = this.live2DMgr?.getModel();
    if (model && model.hitTest(LAppDefine.HIT_AREA_BODY, vx, vy)) {
      window.dispatchEvent(new CustomEvent('live2d:hoverbody', { detail: { canvas: this.canvas } }));
    }
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
