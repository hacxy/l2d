import type { UnsubscribeFunction } from 'emittery';
import type { InternalModel } from 'pixi-live2d-display';
import type { Emits } from './types';
import Emittery from 'emittery';
import { Live2DModel, MotionPreloadStrategy, SoundManager } from 'pixi-live2d-display';
import { HitAreaFrames } from 'pixi-live2d-display/extra';
import * as PIXI from 'pixi.js';

window.PIXI = PIXI;
window.PIXI.utils.skipHello();
export interface Options {
  path: string
  width?: number
  height?: number
  x?: number
  y?: number
  scale?: number
}

export class L2D {
  private app: PIXI.Application;
  private model?: Live2DModel<InternalModel>;
  private canvasEl: HTMLCanvasElement;
  private emittery = new Emittery<Emits>();
  private hitAreaFrames = new HitAreaFrames();

  constructor(private el: HTMLElement) {
    const oldCanvas: HTMLCanvasElement | null = el.querySelector('#l2d-canvas');
    this.canvasEl = document.createElement('canvas');
    if (!oldCanvas) {
      el?.appendChild(this.canvasEl);
      this.canvasEl.id = 'l2d-canvas';
    }
    else {
      this.canvasEl = oldCanvas;
    }
    this.app = new PIXI.Application({
      view: this.canvasEl!,
      resolution: 2,
      autoStart: true,
      autoDensity: true,
      backgroundAlpha: 0,
      resizeTo: el!
    });
  }

  on(eventName: keyof Emits, listener: (eventData: Emits[keyof Emits]) => void | Promise<void>): UnsubscribeFunction {
    return this.emittery.on(eventName, listener);
  }

  /**
   * 加载模型, 加载时可以设置初始属性用于决定如何展示模型
   * 如果当前canvas中已经存在模型, 则会先移除之前加载的模型
   * @param options
   */
  async loadModel(options: Options) {
    const { path } = options;
    return new Promise<void>((resolve, reject) => {
      Live2DModel.from(path, {
        motionPreload: MotionPreloadStrategy.IDLE,
        onError(err) {
          console.error(err);
          reject(err);
        },
      }).then(model => {
        this.model = model;

        this.setModel(options);
        if (model) {
          this.removeModel();
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

  private setModel(options: Omit<Options, 'path'>) {
    if (!this.model?.width) {
      console.error('Cannot set properties before the model has finished loading.');
      return;
    }
    let { x = 0, y = 0, scale = 1, width, height } = options;
    this.model!.scale.set(scale, scale);
    this.model!.position.x = x;
    this.model!.position.y = y;
    width = width ?? this.model.width;
    height = height ?? this.model.height;

    this.el.style.width = `${width}px`;
    this.el.style.height = `${height}px`;
    this.canvasEl.width = width;
    this.canvasEl.height = height;
    this.canvasEl.style.width = `${width}px`;
    this.canvasEl.style.height = `${height}px`;
    SoundManager.volume = 0;
    this.app.resize();
  }

  /**
   * 设置模型在canvas中的坐标
   * @param x
   * @param y
   */
  setPosition(x: number = 0, y = 0) {
    if (this.verifyModel()) {
      this.model!.position.x = x;
      this.model!.position.y = y;
    }
  }

  /**
   * 设置旋转角度
   * @param value
   */
  setRotaion(value: number) {
    if (this.verifyModel()) {
      this.model!.rotation = (Math.PI * value) / 180;
    }
  }

  /**
   * 设置锚点
   * @param x
   * @param y
   */
  setAnchor(x: number, y: number) {
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
  removeModel() {
    const childLen = this.app?.stage.children.length || 0;
    if (childLen > 0) {
      this.app.stage.removeChildren(0);
    }
  }

  // 设置缩放
  setScale(x?: number, y?: number) {
    if (this.verifyModel()) {
      if (!y && x) {
        y = x;
      }
      this.model?.scale.set(x, y);
    }
  }

  setSize(width?: number, height?: number) {
    if (this.verifyModel()) {
      width = width ?? this.model!.width;
      height = height ?? this.model!.height;

      this.el.style.width = `${width}px`;
      this.el.style.height = `${height}px`;
      this.canvasEl.width = width;
      this.canvasEl.height = height;
      this.canvasEl.style.width = `${width}px`;
      this.canvasEl.style.height = `${height}px`;
      this.app.resize();
    }
  }

  /**
   * 设置音量
   * @param value
   */
  setVolume(value: number) {
    SoundManager.volume = value;
  }
}

