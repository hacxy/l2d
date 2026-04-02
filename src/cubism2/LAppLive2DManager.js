import logger from '../logger.js';
import LAppDefine from './LAppDefine.js';
import LAppModel from './LAppModel.js';
import { Live2DFramework } from './Live2DFramework.js';
import PlatformManager from './PlatformManager.js';

class LAppLive2DManager {
  constructor(canvas) {
    this.model = null;
    this.reloading = false;
    this.platformManager = new PlatformManager(canvas);
    Live2D.init();
  }

  activatePlatformManager() {
    Live2DFramework.setPlatformManager(this.platformManager);
  }

  getModel() {
    return this.model;
  }

  releaseModel(gl) {
    if (this.model) {
      this.model.release(gl);
      this.model = null;
    }
  }

  async changeModel(gl, modelSettingPath) {
    return new Promise((resolve, reject) => {
      if (this.reloading)
        return;
      this.reloading = true;
      const oldModel = this.model;
      const newModel = new LAppModel();
      newModel.load(gl, modelSettingPath, () => {
        if (oldModel) {
          oldModel.release(gl);
        }
        this.model = newModel;
        this.reloading = false;
        resolve();
      });
    });
  }

  async changeModelWithJSON(gl, modelSettingPath, modelSetting) {
    if (this.reloading)
      return;
    this.reloading = true;
    const oldModel = this.model;
    const newModel = new LAppModel();
    newModel.onModelFileLoaded = this.onModelFileLoaded;
    newModel.onTexturesLoaded = this.onTexturesLoaded;
    newModel.onLoadStart = this.onLoadStart;
    newModel.onProgress = this.onProgress;
    newModel.onMotionStart = this.onMotionStart;
    newModel.onMotionEnd = this.onMotionEnd;
    newModel.onExpressionStart = this.onExpressionStart;
    await newModel.loadModelSetting(modelSettingPath, modelSetting);
    if (oldModel) {
      oldModel.release(gl);
    }
    this.model = newModel;
    this.reloading = false;
  }

  setDrag(x, y) {
    if (this.model) {
      this.model.setDrag(x, y);
    }
  }

  maxScaleEvent() {
    logger.trace('Max scale event.');
    if (this.model) {
      this.model.startRandomMotion(LAppDefine.MOTION_GROUP_PINCH_IN, LAppDefine.PRIORITY_NORMAL);
    }
  }

  minScaleEvent() {
    logger.trace('Min scale event.');
    if (this.model) {
      this.model.startRandomMotion(LAppDefine.MOTION_GROUP_PINCH_OUT, LAppDefine.PRIORITY_NORMAL);
    }
  }

}
export default LAppLive2DManager;
