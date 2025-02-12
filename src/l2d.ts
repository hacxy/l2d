import type { UnsubscribeFunction } from 'emittery';
import type { InternalModel } from 'pixi-live2d-display';
import type { Emits, Options } from './types';
import Emittery from 'emittery';
import { MotionSync } from 'live2d-motionsync';
import { Live2DModel, MotionPreloadStrategy, SoundManager } from 'pixi-live2d-display';
import { HitAreaFrames } from 'pixi-live2d-display/extra';
import * as PIXI from 'pixi.js';

window.PIXI = PIXI;
window.PIXI.utils.skipHello();

export class L2D {
  private app: PIXI.Application;
  private model?: Live2DModel<InternalModel>;
  private emittery = new Emittery<Emits>();
  private hitAreaFrames = new HitAreaFrames();
  private motion?: MotionSync;

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

  on(eventName: keyof Emits, listener: (eventData: Emits[keyof Emits]) => void | Promise<void>): UnsubscribeFunction {
    return this.emittery.on(eventName, listener);
  }

  /**
   * 加载模型, 加载时可以设置初始属性用于决定如何展示模型
   * @param options
   */
  async load(options: Options) {
    const { anchor = [], position, rotaion, volume, scale, path, motionSync } = options;
    return new Promise<void>((resolve, reject) => {
      Live2DModel.from(path, {
        motionPreload: MotionPreloadStrategy.ALL,
        // autoInteract: false,
        onError(err) {
          console.error(err);
          reject(err);
        },
      }).then(model => {
        this.model = model;
        this.motion = new MotionSync(model.internalModel);
        if (motionSync) {
          this.motion.loadMotionSyncFromUrl(motionSync);
        }
        if (model) {
          this.setAnchor(...anchor);
          this.setRotaion(rotaion);
          this.setVolume(volume);
          this.setScale(scale);
          this.setPosition(position);
          this.app.stage.addChild(model);
        }
        resolve();
      });
    });
  }

  private verifyModel() {
    if (!this.model?.width) {
      console.error('Cannot set properties before the model has finished loading.');
      return false;
    }
    else {
      return true;
    }
  }

  /**
   * 设置模型在canvas中的坐标
   */
  setPosition(position: [x: number, y: number] | 'center') {
    if (Array.isArray(position)) {
      const [x, y] = position;
      if (this.verifyModel()) {
        this.model!.position.x = x;
        this.model!.position.y = y;
      }
    }
    else {
      this.moveCenter();
    }
  }

  /**
   * 设置旋转角度
   * @param value
   */
  setRotaion(value: number = 0) {
    if (this.verifyModel()) {
      this.model!.rotation = (Math.PI * value) / 180;
    }
  }

  /**
   * 设置锚点
   * @param x
   * @param y
   */
  setAnchor(x?: number, y?: number) {
    if (this.verifyModel()) {
      this.model!.anchor.set(x, y);
    }
  }

  /**
   * 显示可点击区域
   */
  showHitAreaFrames(): void {
    this.model?.addChild(this.hitAreaFrames);
  }

  /**
   * 隐藏点击区域
   */
  hideHitAreaFrames(): void {
    this.model?.removeChildren(0);
  }

  /**
   * 将canvas中的模型移除
   */
  destroy() {
    const childLen = this.app?.stage?.children?.length || 0;
    if (childLen > 0) {
      this.app.stage.removeChildren(0, childLen);
    }
    this.model.destroy();
  }

  // 设置缩放
  setScale(value: number | 'auto') {
    if (this.verifyModel()) {
      if (typeof value === 'number') {
        this.model?.scale.set(value, value);
      }
      else {
        const ratio = this.model.height / this.model.width;

        this.model.width = this.app.view.width / 2;
        this.model.height = this.model.width * ratio;
      }
    }
  }

  /**
   * 设置音量
   * @param value
   */
  setVolume(value?: number) {
    SoundManager.volume = value;
  }

  moveCenter() {
    this.model.x = (this.app.view.width / 2 - this.model.width) / 2;
    this.model.y = (this.app.view.height / 2 - this.model.height) / 2;
  }

  /**
   * 说话(口型动作同步)
   * @param audioBuffer
   */
  async speak(audioBuffer: AudioBuffer) {
    if (!this.motion || !this.model)
      return;
    if (audioBuffer instanceof AudioBuffer) {
      this.motion.play(audioBuffer);
    }
  }
}

