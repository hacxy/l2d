import type { InternalModel, Live2DModel } from 'pixi-live2d-display';
import type { Emits, Options } from './types';
import Emittery from 'emittery';
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

  createSync(options: Options): Model {
    const { anchor = [], rotaion, volume, scale = 'auto', position = 'center' } = options;
    const emittery = new Emittery<Emits>();
    const live2dModel = Model.create(options, emittery);

    const model = new Model(live2dModel, this.app, emittery);
    model.on('modelLoaded', () => {
      model.setAnchor(...anchor);
      model.setRotaion(rotaion);
      model.setVolume(volume);
      model.setScale(scale);
      model.setPosition(position);

      this.app.stage.addChild(live2dModel);
    });
    return model;
  }

  create(options: Options): Promise<Model> {
    const { anchor = [], rotaion, volume, scale = 'auto', position = 'center' } = options;
    let live2dModel: Live2DModel<InternalModel>;
    const emittery = new Emittery<Emits>();

    return new Promise((resolve, reject) => {
      try {
        live2dModel = Model.create(options, emittery);
      }
      catch (e) {
        reject(e);
        throw new Error(e);
      }

      live2dModel.on('modelLoaded', () => {
        const model = new Model(live2dModel, this.app, emittery);

        model.setAnchor(...anchor);
        model.setRotaion(rotaion);
        model.setVolume(volume);
        model.setScale(scale);
        model.setPosition(position);

        this.app.stage.addChild(live2dModel);
        resolve(model);
      });
    });
  }
}

