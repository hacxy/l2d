import type { InternalModel, Live2DModel } from 'pixi-live2d-display';
import type { Options } from './types';
import { MotionSync } from 'live2d-motionsync';
import { MotionSync as MotionSyncStream } from 'live2d-motionsync/stream';
import * as PIXI from 'pixi.js';
import { Model } from './model';

window.PIXI = PIXI;
window.PIXI.utils.skipHello();

export class L2D {
  private app: PIXI.Application;

  constructor(private canvasEl: HTMLCanvasElement) {
    this.app = new PIXI.Application({
      view: this.canvasEl,
      resolution: 2,
      autoStart: true,
      autoDensity: true,
      backgroundAlpha: 0,
      resizeTo: canvasEl.parentElement
    });
  }

  get modelList() {
    return this.app.stage.children;
  }

  async create(options: Options) {
    const { anchor = [], rotaion, volume, scale = 'auto', position = 'center' } = options;
    let _model: Live2DModel<InternalModel>;
    try {
      _model = await Model.create(options);
    }
    catch (e) {
      throw new Error(e);
    }
    const _motion = new MotionSync(_model.internalModel);
    const _motionStream = new MotionSyncStream(_model.internalModel);

    if (options.motionSync) {
      _motion.loadMotionSyncFromUrl(options.motionSync);
      _motionStream.loadMotionSyncFromUrl(options.motionSync);
    }

    const model = new Model(_model, _motion, _motionStream, this.app);

    model.setAnchor(...anchor);
    model.setRotaion(rotaion);
    model.setVolume(volume);
    model.setScale(scale);
    model.setPosition(position);

    this.app.stage.addChild(_model);

    return model;
  }
}

