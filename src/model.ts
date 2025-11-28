import type { UnsubscribeFunction } from 'emittery';
import type Emittery from 'emittery';
import type { InternalModel, MotionPreloadStrategy } from 'pixi-live2d-display';
import type { Application } from 'pixi.js';
import type { Emits, Options } from './types.js';
import { isArray, isFunction, isNumber, isString } from '@hacxy/utils';
import { MotionSync } from 'live2d-motionsync';
import { MotionSync as MotionSyncStream } from 'live2d-motionsync/stream';
import { Live2DModel, SoundManager } from 'pixi-live2d-display';
import { HitAreaFrames } from 'pixi-live2d-display/extra';
import { MotionPreload } from './constants.js';

export class Model {
  private hitAreaFrames: HitAreaFrames;
  private motion?: MotionSync;
  private motionStream?: MotionSyncStream;

  constructor(
    private live2dModel: Live2DModel<InternalModel>,
    private app: Application,
    private emittery: Emittery<Emits>
  ) {
    this.hitAreaFrames = new HitAreaFrames();

    // live2dModel.once('load', () => {
    //   this.live2dModel.internalModel.on('afterMotionUpdate', () => this.emittery.emit('afterMotionUpdate'));
    // });

    live2dModel.on('hit', area => {
      this.emittery.emit('hit', area);
    });
  }

  /**
   * 自定义参数
   * @param id
   * @param value
   */
  setParam(id: string, value: number) {
    if (isFunction((this.live2dModel.internalModel.coreModel as any).setParameterValueById)) {
      // cubism 4.0
      (this.live2dModel.internalModel.coreModel as any).setParameterValueById(id, value);
    }
    else if (isFunction((this.live2dModel.internalModel.coreModel as any).setParamFloat)) {
      // cubism 2.0
      (this.live2dModel.internalModel.coreModel as any).setParamFloat(id, value);
    }
  }

  /**
   * 获取所有表情, 如果一个模型在其设置中没有定义表情， ExpressionManager 将完全不会创建，这意味着该方法只能返回一个空数组。
   */
  getExpressions() {
    const definitions = this.live2dModel.internalModel.motionManager.expressionManager?.definitions || [];
    return definitions.map(item => {
      return {
        id: item.name || item.Name,
        name: item.name || item.Name,
        file: item.file || item.File
      };
    });
  }

  /**
   * 根据表情id播放表情
   * @param id Expression Id (表情id)
   */
  async expression(id: string) {
    await this.live2dModel.expression(id);
  }

  /**
   * 获取当前模型所有动作组名称
   */
  getMotionGroupNames() {
    return Object.keys(this.live2dModel.internalModel.motionManager.definitions);
  }

  /**
   * 根据动作组名称获取动作文件列表
   * @param name
   */
  getMotionListByGroupName(name: string) {
    return this.live2dModel.internalModel.motionManager.definitions[name];
  }

  /**
   * 根据动作组名称播放动作
   * @param group
   * @param index
   */
  async playMotion(group: string, index?: number) {
    return this.live2dModel.motion(group, index);
  }

  /** @ignore */
  static create(options: Options, emittery: Emittery<Emits>): Live2DModel<InternalModel> {
    const { path } = options;

    const _live2dModel = Live2DModel.fromSync(path, {
      motionPreload: options.motionPreload as unknown as MotionPreloadStrategy || MotionPreload.IDLE as unknown as MotionPreloadStrategy,
    });

    _live2dModel.on('settingsJSONLoaded', json => {
      emittery.emit('settingsJSONLoaded', json);
    });

    _live2dModel.on('settingsLoaded', setting => {
      emittery.emit('settingsLoaded', setting);
    });
    _live2dModel.on('textureLoaded', () => {
      emittery.emit('textureLoaded');
    });
    _live2dModel.on('modelLoaded', () => {
      emittery.emit('modelLoaded');
    });
    _live2dModel.on('ready', () => {
      emittery.emit('ready');
    });

    return _live2dModel;
  }

  on(eventName: keyof Emits, listener: (eventData: Emits[keyof Emits]) => void | Promise<void>): UnsubscribeFunction {
    return this.emittery.on(eventName, listener);
  }

  /**
   * 设置模型在canvas中的坐标
   */
  setPosition(position: [x: number, y: number] | 'center') {
    this.app.resize();
    if (isArray(position)) {
      const [x, y] = position;
      this.live2dModel!.position.x = x;
      this.live2dModel!.position.y = y;
    }
    else if (isString(position)) {
      this.moveCenter();
    }
  }

  /**
   * 设置旋转角度
   * @param value
   */
  setRotaion(value: number = 0) {
    this.live2dModel!.rotation = (Math.PI * value) / 180;
  }

  /**
   * 设置锚点
   * @param x
   * @param y
   */
  setAnchor(x?: number, y?: number) {
    this.app.resize();
    this.live2dModel.anchor.set(x, y);
  }

  /**
   * 显示可点击区域
   */
  showHitAreaFrames(): void {
    this.live2dModel.addChild(this.hitAreaFrames);
  }

  /**
   * 隐藏点击区域
   */
  hideHitAreaFrames(): void {
    this.live2dModel.removeChildren(0);
  }

  /**
   * 销毁模型
   */
  destroy() {
    this.live2dModel.destroy();
  }

  /**
   * 设置缩放
   */
  setScale(value: number | 'auto') {
    if (isNumber(value)) {
      this.live2dModel?.scale.set(value, value);
    }
    else if (isString(value)) {
      this.app.resize();
      const ratio = this.live2dModel.height / this.live2dModel.width;
      this.live2dModel.width = this.app.view.width / 2;
      this.live2dModel.height = this.live2dModel.width * ratio;
    }
  }

  /**
   * 设置音量
   * @param value
   */
  setVolume(value?: number) {
    SoundManager.volume = value || 0;
  }

  /**
   * 将模型移动至画布中间
   */
  moveCenter() {
    this.live2dModel.x = (this.app.view.width / 2 - this.live2dModel.width) / 2;
    this.live2dModel.y = (this.app.view.height / 2 - this.live2dModel.height) / 2;
  }

  /**
   * 加载用于AudioBuffer的motionsync文件
   * @param url motionsync3.json 的url地址
   */
  loadMotionFromUrl(url: string) {
    this.motion = new MotionSync(this.live2dModel.internalModel);
    this.motion.loadMotionSyncFromUrl(url);
  }

  /**
   * 加载用于StreamMedia的motionsync文件
   * @param url motionsync3.json 的url地址
   */
  loadMotionStreamFromUrl(url: string) {
    this.motionStream = new MotionSyncStream(this.live2dModel.internalModel);
    this.motionStream.loadMotionSyncFromUrl(url);
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

  /**
   * 用于重置AudioBuffer播放的口型同步动作
   */
  resetSpeak() {
    this.motion?.reset();
  }

  /**
   * 说话(媒体流)
   * @param mediaStream
   */
  async speakStream(mediaStream: MediaStream) {
    this.motionStream?.play(mediaStream);
  }

  /**
   * 用于重置StreamMedia播放的口型同步动作
   */
  resetSpeakStream() {
    this.motionStream?.reset();
  }
}
