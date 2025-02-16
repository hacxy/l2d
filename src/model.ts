import type { UnsubscribeFunction } from 'emittery';
import type { MotionSync } from 'live2d-motionsync';
import type { MotionSync as MotionSyncStream } from 'live2d-motionsync/stream';
import type { InternalModel } from 'pixi-live2d-display';
import type { Application } from 'pixi.js';
import type { Emits, Options } from './types';
import Emittery from 'emittery';
import { Live2DModel, MotionPreloadStrategy, SoundManager } from 'pixi-live2d-display';
import { HitAreaFrames } from 'pixi-live2d-display/extra';

export class Model {
  private emittery: Emittery<Emits>;
  private hitAreaFrames: HitAreaFrames;

  constructor(private model: Live2DModel<InternalModel>, private motion: MotionSync, private motionStream: MotionSyncStream, private app: Application) {
    this.emittery = new Emittery<Emits>();
    this.hitAreaFrames = new HitAreaFrames();
    model.on('hit', area => {
      this.emittery.emit('hit', area);
    });
  }

  /**
   * 获取当前模型所有动作组
   */
  getMotionGroups() {
    return this.model.internalModel.motionManager.motionGroups;
  }

  playMotion(group: string, index?: number) {
    this.model.motion(group, index);
  }

  static create(options: Options): Promise<Live2DModel<InternalModel>> {
    const { path } = options;

    return new Promise((resolve, reject) => {
      Live2DModel.from(path, {
        motionPreload: MotionPreloadStrategy.ALL,
      }).then(res => {
        resolve(res);
      }).catch(e => {
        reject(e);
      });
    });
  }

  on(eventName: keyof Emits, listener: (eventData: Emits[keyof Emits]) => void | Promise<void>): UnsubscribeFunction {
    return this.emittery.on(eventName, listener);
  }

  /**
   * 设置模型在canvas中的坐标
   */
  setPosition(position: [x: number, y: number] | 'center') {
    this.app.resize();
    if (Array.isArray(position)) {
      const [x, y] = position;
      this.model!.position.x = x;
      this.model!.position.y = y;
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
    this.model!.rotation = (Math.PI * value) / 180;
  }

  /**
   * 设置锚点
   * @param x
   * @param y
   */
  setAnchor(x?: number, y?: number) {
    this.app.resize();
    this.model.anchor.set(x, y);
  }

  /**
   * 显示可点击区域
   */
  showHitAreaFrames(): void {
    this.model.addChild(this.hitAreaFrames);
  }

  /**
   * 隐藏点击区域
   */
  hideHitAreaFrames(): void {
    this.model.removeChildren(0);
  }

  /**
   * 销毁模型
   */
  destroy() {
    this.model.destroy();
  }

  // 设置缩放
  setScale(value: number | 'auto') {
    if (typeof value === 'number') {
      this.model?.scale.set(value, value);
    }
    else {
      this.app.resize();
      const ratio = this.model.height / this.model.width;
      this.model.width = this.app.view.width / 2;
      this.model.height = this.model.width * ratio;
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
    if (!this.motion)
      return;
    if (audioBuffer instanceof AudioBuffer) {
      this.motion.play(audioBuffer);
    }
  }

  async speakStream(mediaStream: MediaStream) {
    this.motionStream.play(mediaStream);
  }
}
