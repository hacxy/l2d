// @ts-nocheck
import { ensureCssSize } from '../../canvas-manager.js';
import { EVENTS } from '../../const.js';


// ----- 通过 Vite ?raw 内联 GLSL 着色器，避免运行时 fetch 加载外部文件 -----
import _vertShaderSrc from './Framework/Shaders/WebGL/vertshadersrc.vert?raw';
import _vertShaderSrcMasked from './Framework/Shaders/WebGL/vertshadersrcmasked.vert?raw';
import _vertShaderSrcSetupMask from './Framework/Shaders/WebGL/vertshadersrcsetupmask.vert?raw';
import _fragShaderSrcSetupMask from './Framework/Shaders/WebGL/fragshadersrcsetupmask.frag?raw';
import _fragShaderSrcPremultipliedAlpha from './Framework/Shaders/WebGL/fragshadersrcpremultipliedalpha.frag?raw';
import _fragShaderSrcMaskPremultipliedAlpha from './Framework/Shaders/WebGL/fragshadersrcmaskpremultipliedalpha.frag?raw';
import _fragShaderSrcMaskInvertedPremultipliedAlpha from './Framework/Shaders/WebGL/fragshadersrcmaskinvertedpremultipliedalpha.frag?raw';
import _vertShaderSrcCopy from './Framework/Shaders/WebGL/vertshadersrccopy.vert?raw';
import _fragShaderSrcCopy from './Framework/Shaders/WebGL/fragshadersrccopy.frag?raw';
import _fragShaderSrcColorBlend from './Framework/Shaders/WebGL/fragshadersrccolorblend.frag?raw';
import _fragShaderSrcAlphaBlend from './Framework/Shaders/WebGL/fragshadersrcalphablend.frag?raw';
import _vertShaderSrcBlend from './Framework/Shaders/WebGL/vertshadersrcblend.vert?raw';
import _fragShaderSrcPremultipliedAlphaBlend from './Framework/Shaders/WebGL/fragshadersrcpremultipliedalphablend.frag?raw';

// 必须在导入 Framework 渲染模块之前先引入 CubismShader_WebGL，以便 patch prototype
import { CubismShader_WebGL } from '@framework/rendering/cubismshader_webgl';

// 着色器文件名 → 内联内容映射
const _inlineShaders: Record<string, string> = {
  'vertshadersrc.vert': _vertShaderSrc,
  'vertshadersrcmasked.vert': _vertShaderSrcMasked,
  'vertshadersrcsetupmask.vert': _vertShaderSrcSetupMask,
  'fragshadersrcsetupmask.frag': _fragShaderSrcSetupMask,
  'fragshadersrcpremultipliedalpha.frag': _fragShaderSrcPremultipliedAlpha,
  'fragshadersrcmaskpremultipliedalpha.frag': _fragShaderSrcMaskPremultipliedAlpha,
  'fragshadersrcmaskinvertedpremultipliedalpha.frag': _fragShaderSrcMaskInvertedPremultipliedAlpha,
  'vertshadersrccopy.vert': _vertShaderSrcCopy,
  'fragshadersrccopy.frag': _fragShaderSrcCopy,
  'fragshadersrccolorblend.frag': _fragShaderSrcColorBlend,
  'fragshadersrcalphablend.frag': _fragShaderSrcAlphaBlend,
  'vertshadersrcblend.vert': _vertShaderSrcBlend,
  'fragshadersrcpremultipliedalphablend.frag': _fragShaderSrcPremultipliedAlphaBlend,
};

// Patch：将 loadShader 替换为直接返回内联字符串，不再发起网络请求
CubismShader_WebGL.prototype.loadShader = async function (url: string): Promise<string> {
  const filename = url.split('/').pop().toLowerCase();
  return _inlineShaders[filename] ?? '';
};

// ----- 引入官方 SDK 的 Demo 工具类 -----
import { CubismFramework, Option } from '@framework/live2dcubismframework';
import { LAppPal } from './Samples/TypeScript/Demo/src/lapppal';
import { LAppSubdelegate } from './Samples/TypeScript/Demo/src/lappsubdelegate';
import { LAppLive2DManager } from './Samples/TypeScript/Demo/src/lapplive2dmanager';
import { LAppModel } from './Samples/TypeScript/Demo/src/lappmodel';
import * as LAppDefine from './Samples/TypeScript/Demo/src/lappdefine';

// 静默 SDK 内部日志
LAppPal.printMessage = () => {};

// 保证每帧只调用一次 updateTime
let _lastUpdateTimestamp = -1;
function updateTimeOnce(timestamp: number) {
  if (timestamp !== _lastUpdateTimestamp) {
    _lastUpdateTimestamp = timestamp;
    LAppPal.updateTime();
  }
}

/**
 * 自定义 Subdelegate：
 * 继承官方 LAppSubdelegate，重写 initialize / onResize / update，
 * 跳过背景/齿轮精灵加载，跳过自动加载模型，使背景透明。
 */
class AppSubdelegate extends LAppSubdelegate {
  _userScale: number | undefined;
  _userPosition: [number, number] | undefined;

  public initialize(canvas: HTMLCanvasElement): boolean {
    if (!this._glManager.initialize(canvas)) {
      return false;
    }

    this._canvas = canvas;
    ensureCssSize(canvas);

    if (LAppDefine.CanvasSize === 'auto') {
      this.resizeCanvas();
    }
    else {
      canvas.width = LAppDefine.CanvasSize.width;
      canvas.height = LAppDefine.CanvasSize.height;
    }

    this._textureManager.setGlManager(this._glManager);

    const gl: WebGL2RenderingContext = this._glManager.getGl();

    if (!this._frameBuffer) {
      this._frameBuffer = gl.getParameter(gl.FRAMEBUFFER_BINDING);
    }

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    this._view.initialize(this);

    // 设置占位精灵对象，防止 LAppView.release() / onTouchesEnded() 访问 null 时崩溃
    this._view._gear = { render: () => {}, isHit: () => false, release: () => {} };
    this._view._back = { render: () => {}, release: () => {} };

    // 手动设置 live2d 管理器的 subdelegate，绕过 initialize() 的自动模型加载
    this._live2dManager._subdelegate = this;

    this._resizeObserver = new window.ResizeObserver(
      (entries: ResizeObserverEntry[], observer: ResizeObserver) =>
        this.resizeObserverCallback.call(this, entries, observer)
    );
    this._resizeObserver.observe(this._canvas);

    return true;
  }

  public onResize(): void {
    this.resizeCanvas();
    this._view.initialize(this);
    if (this._userScale !== undefined) {
      this._view._viewMatrix.adjustScale(0, 0, this._userScale);
    }
    if (this._userPosition !== undefined) {
      this._view._viewMatrix.translate(this._userPosition[0], this._userPosition[1]);
    }
  }

  public update(): void {
    if (this._glManager.getGl().isContextLost()) {
      return;
    }

    if (this._needResize) {
      this.onResize();
      this._needResize = false;
    }

    const gl: WebGL2RenderingContext = this._glManager.getGl();

    // 透明背景（官方 Demo 默认不透明黑色）
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clearDepth(1.0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // 仅在有模型时才触发渲染，避免 LAppLive2DManager.onUpdate() 访问空数组崩溃
    if (this._live2dManager._models.length > 0) {
      this._view.render();
    }
  }
}

/**
 * 主应用委托类（不再继承官方单例 LAppDelegate）
 * 对外暴露与原版 AppDelegate 相同的接口，以保证 l2d.ts 无需改动。
 */
export class AppDelegate {
  private _canvas: HTMLCanvasElement;
  private _subdelegates: AppSubdelegate[] = [];
  private _cubismOption: Option;
  private _released = false;
  _drawFrameId: number | null = null;
  _modelLoadedEmitted: boolean = false;
  _onLoaded: (() => void) | null = null;
  _expressionWasPlaying: boolean = false;
  private mouseMoveEventListener: ((e: MouseEvent) => void) | null = null;
  private mouseEndedEventListener: ((e: MouseEvent) => void) | null = null;
  private tapEventListener: ((e: PointerEvent) => void) | null = null;

  public constructor(canvas: HTMLCanvasElement) {
    this._canvas = canvas;
    this._cubismOption = new Option();
  }

  public run(): void {
    const loop = (timestamp: number) => {
      updateTimeOnce(timestamp);

      if (!this._modelLoadedEmitted && this._isModelReady()) {
        this._modelLoadedEmitted = true;
        if (this._onLoaded) {
          this._onLoaded();
        }
      }

      for (const sd of this._subdelegates) {
        sd.update();
      }

      // 检测表情结束
      const model = this._subdelegates[0]?.getLive2DManager()?._models?.[0];
      if (model) {
        const exprFinished = model._expressionManager?.isFinished();
        if (!this._expressionWasPlaying && exprFinished === false) {
          this._expressionWasPlaying = true;
        }
        else if (this._expressionWasPlaying && exprFinished === true) {
          this._expressionWasPlaying = false;
          window.dispatchEvent(new CustomEvent(EVENTS.EXPRESSION_END, { detail: { canvas: this._canvas } }));
        }
      }

      this._drawFrameId = window.requestAnimationFrame(loop);
    };
    loop();
  }

  public onLoaded(callback: () => void): void {
    this._onLoaded = callback;
  }

  public stop(): void {
    if (this._drawFrameId) {
      window.cancelAnimationFrame(this._drawFrameId);
      this._drawFrameId = null;
    }
  }

  public release(): void {
    this._released = true;
    this.stop();
    this.releaseEventListener();
    for (const sd of this._subdelegates) {
      sd.release();
    }
    this._subdelegates = [];
    CubismFramework.dispose();
    this._cubismOption = null;
  }

  private transformOffset(e: MouseEvent | PointerEvent): { x: number; y: number } {
    const subdelegate = this._subdelegates[0];
    const canvas = subdelegate.getCanvas();
    const rect: DOMRect = canvas.getBoundingClientRect();
    const posX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const posY = (e.clientY - rect.top) * (canvas.height / rect.height);
    const x: number = subdelegate._view.transformViewX(posX);
    const y: number = subdelegate._view.transformViewY(posY);
    return { x, y };
  }

  private _isModelReady(): boolean {
    if (CubismFramework.getIdManager() === null) return false;
    const manager = this._subdelegates[0]?.getLive2DManager();
    const model = manager?._models?.[0];
    // LoadStep.CompleteSetup === 23（SDK 5-r.5 新增了 SetupLook 导致枚举值 +1）
    return model?._state === 23;
  }

  private onMouseMove(e: MouseEvent): void {
    if (!this._isModelReady()) return;
    const { x, y } = this.transformOffset(e);
    this._subdelegates[0].getLive2DManager().onDrag(x, y);
  }

  private onMouseEnd(e: MouseEvent): void {
    if (!this._isModelReady()) return;
    this._subdelegates[0].getLive2DManager().onDrag(0.0, 0.0);
  }

  private onTap(e: PointerEvent): void {
    if (!this._isModelReady()) return;
    const lapplive2dmanager = this._subdelegates[0].getLive2DManager();
    const { x, y } = this.transformOffset(e);
    const model = lapplive2dmanager._models[0];
    const count: number = model._modelSetting.getHitAreasCount();

    for (let i = 0; i < count; i++) {
      const areaName: string = model._modelSetting.getHitAreaName(i);
      if (model.hitTest(areaName, x, y)) {
        window.dispatchEvent(new CustomEvent(EVENTS.TAP_BODY, {
          detail: { canvas: this._canvas, areaName },
        }));
      }
    }
  }

  public initializeEventListener(): void {
    this.mouseMoveEventListener = this.onMouseMove.bind(this);
    this.mouseEndedEventListener = this.onMouseEnd.bind(this);
    this.tapEventListener = this.onTap.bind(this);

    document.addEventListener('mousemove', this.mouseMoveEventListener, { passive: true });
    document.addEventListener('mouseout', this.mouseEndedEventListener, { passive: true });
    document.addEventListener('pointerdown', this.tapEventListener, { passive: true });
  }

  public releaseEventListener(): void {
    if (this.mouseMoveEventListener) {
      document.removeEventListener('mousemove', this.mouseMoveEventListener);
      this.mouseMoveEventListener = null;
    }
    if (this.mouseEndedEventListener) {
      document.removeEventListener('mouseout', this.mouseEndedEventListener);
      this.mouseEndedEventListener = null;
    }
    if (this.tapEventListener) {
      document.removeEventListener('pointerdown', this.tapEventListener);
      this.tapEventListener = null;
    }
  }

  public initialize(): boolean {
    LAppPal.updateTime();
    this._cubismOption.logFunction = LAppPal.printMessage;
    this._cubismOption.loggingLevel = LAppDefine.CubismLoggingLevel;
    CubismFramework.startUp(this._cubismOption);
    CubismFramework.initialize();

    try {
      this.initializeSubdelegates();
    }
    catch {
      return false;
    }
    this.initializeEventListener();

    return true;
  }

  public initializeSubdelegates(): void {
    const subdelegate = new AppSubdelegate();
    const result = subdelegate.initialize(this._canvas);
    if (!result) {
      throw new Error('Failed to initialize AppSubdelegate');
    }
    this._subdelegates.push(subdelegate);
  }

  public changeModel(modelSettingPath: string): void {
    this._modelLoadedEmitted = false;
    const segments = modelSettingPath.split('/');
    const modelJsonName = segments.pop();
    const modelPath = `${segments.join('/')}/`;
    const live2dManager = this._subdelegates[0].getLive2DManager();

    // 释放旧模型
    live2dManager.releaseAllModel();

    const instance = new LAppModel();
    instance.setSubdelegate(this._subdelegates[0]);

    window.dispatchEvent(new CustomEvent(EVENTS.LOAD_START, { detail: { canvas: this._canvas, total: 0 } }));

    instance.onProgress = (loaded, total, file) => {
      window.dispatchEvent(new CustomEvent(EVENTS.LOAD_PROGRESS, {
        detail: { canvas: this._canvas, loaded, total, file },
      }));
    };

    instance.onMotionStart = ({ group, index, duration, file }) => {
      window.dispatchEvent(new CustomEvent(EVENTS.MOTION_START, {
        detail: { canvas: this._canvas, group, index, duration, file },
      }));
    };

    instance.onMotionEnd = ({ group, index, file }) => {
      window.dispatchEvent(new CustomEvent(EVENTS.MOTION_END, {
        detail: { canvas: this._canvas, group, index, file },
      }));
    };

    instance.loadAssets(modelPath, modelJsonName);
    live2dManager._models.push(instance);
  }

  public setPosition(x: number, y: number): void {
    const subdelegate = this._subdelegates[0];
    subdelegate._userPosition = [x, y];
    const view = subdelegate._view;
    view._viewMatrix.translate(x, y);
    subdelegate.getLive2DManager().setViewMatrix(view._viewMatrix);
  }

  public setParams(params: Record<string, number>): void {
    const model = this._subdelegates[0]?.getLive2DManager()?._models?.[0];
    if (!model) return;
    model._forcedParams = { ...params };
  }

  public setScale(scale: number): void {
    const subdelegate = this._subdelegates[0];
    subdelegate._userScale = scale;
    const view = subdelegate._view;
    view.initialize(subdelegate);
    view._viewMatrix.adjustScale(0, 0, scale);
    if (subdelegate._userPosition !== undefined) {
      view._viewMatrix.translate(subdelegate._userPosition[0], subdelegate._userPosition[1]);
    }
    subdelegate.getLive2DManager().setViewMatrix(view._viewMatrix);
  }

  public resize(): void {
    const subdelegate = this._subdelegates[0];
    const canvas: HTMLCanvasElement = subdelegate.getCanvas();
    const width = canvas.width;
    const height = canvas.height;

    subdelegate._view.initialize(subdelegate);

    const gl: WebGL2RenderingContext = subdelegate.getGlManager().getGl();
    gl.viewport(0, 0, width, height);

    if (subdelegate._userScale !== undefined) {
      subdelegate._view._viewMatrix.adjustScale(0, 0, subdelegate._userScale);
    }
    if (subdelegate._userPosition !== undefined) {
      subdelegate._view._viewMatrix.translate(
        subdelegate._userPosition[0],
        subdelegate._userPosition[1],
      );
    }
    subdelegate.getLive2DManager().setViewMatrix(subdelegate._view._viewMatrix);
  }

  public getHitAreaBounds(): Array<{ name: string; x: number; y: number; w: number; h: number }> {
    if (!this._isModelReady()) return [];
    const subdelegate = this._subdelegates[0];
    const model = subdelegate.getLive2DManager()._models[0];
    const view = subdelegate._view;
    const count: number = model._modelSetting.getHitAreasCount();
    const result = [];

    for (let i = 0; i < count; i++) {
      const name: string = model._modelSetting.getHitAreaName(i);
      const drawId = model._modelSetting.getHitAreaId(i);
      const drawIndex: number = model._model.getDrawableIndex(drawId);
      if (drawIndex < 0) continue;

      const vertCount: number = model._model.getDrawableVertexCount(drawIndex);
      const vertices: Float32Array = model._model.getDrawableVertices(drawIndex);

      let left = vertices[0];
      let right = vertices[0];
      let top = vertices[1];
      let bottom = vertices[1];

      for (let j = 1; j < vertCount; j++) {
        const x = vertices[j * 2];
        const y = vertices[j * 2 + 1];
        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }

      // model local → world (modelMatrix) → screen (viewMatrix) → device px (deviceToScreen inv)
      const wl = model._modelMatrix.transformX(left);
      const wr = model._modelMatrix.transformX(right);
      const wt = model._modelMatrix.transformY(top);
      const wb = model._modelMatrix.transformY(bottom);

      const sl = view._viewMatrix.transformX(wl);
      const sr = view._viewMatrix.transformX(wr);
      const st = view._viewMatrix.transformY(wt);
      const sb = view._viewMatrix.transformY(wb);

      const dl = view._deviceToScreen.invertTransformX(sl);
      const dr = view._deviceToScreen.invertTransformX(sr);
      const dt = view._deviceToScreen.invertTransformY(st);
      const db = view._deviceToScreen.invertTransformY(sb);

      result.push({
        name,
        x: Math.min(dl, dr),
        y: Math.min(dt, db),
        w: Math.abs(dr - dl),
        h: Math.abs(db - dt),
      });
    }
    return result;
  }

  public playMotion(group: string, index?: number, priority: number = 2): void {
    if (this._released) return;
    const model = this._subdelegates[0]?.getLive2DManager()?._models?.[0];
    if (!model) return;
    const resolvedIndex = index !== undefined
      ? index
      : Math.floor(Math.random() * model._modelSetting.getMotionCount(group));
    model.startMotion(group, resolvedIndex, priority);
  }

  public getMotionGroups(): Record<string, number> {
    const model = this._subdelegates[0]?.getLive2DManager()?._models?.[0];
    if (!model?._modelSetting) return {};
    const result: Record<string, number> = {};
    const count: number = model._modelSetting.getMotionGroupCount();
    for (let i = 0; i < count; i++) {
      const name: string = model._modelSetting.getMotionGroupName(i);
      result[name] = model._modelSetting.getMotionCount(name);
    }
    return result;
  }

  public getMotionFiles(): Record<string, string[]> {
    const model = this._subdelegates[0]?.getLive2DManager()?._models?.[0];
    if (!model?._modelSetting) return {};
    const result: Record<string, string[]> = {};
    const count: number = model._modelSetting.getMotionGroupCount();
    for (let i = 0; i < count; i++) {
      const name: string = model._modelSetting.getMotionGroupName(i);
      const motionCount: number = model._modelSetting.getMotionCount(name);
      result[name] = [];
      for (let j = 0; j < motionCount; j++) {
        result[name].push(model._modelSetting.getMotionFileName(name, j));
      }
    }
    return result;
  }

  public setExpression(id?: string): void {
    const model = this._subdelegates[0]?.getLive2DManager()?._models?.[0];
    if (!model) return;
    if (id) {
      model.setExpression(id);
    }
    else {
      if (model._expressions.size === 0) return;
      const keys = [...model._expressions.keys()];
      const no = Math.floor(Math.random() * keys.length);
      id = keys[no];
      model.setExpression(id);
    }
    window.dispatchEvent(new CustomEvent(EVENTS.EXPRESSION_START, {
      detail: { canvas: this._canvas, id },
    }));
  }

  public getExpressions(): string[] {
    const model = this._subdelegates[0]?.getLive2DManager()?._models?.[0];
    if (!model?._modelSetting) return [];
    const result: string[] = [];
    const count: number = model._modelSetting.getExpressionCount();
    for (let i = 0; i < count; i++) {
      result.push(model._modelSetting.getExpressionName(i));
    }
    return result;
  }

  public get subdelegates() {
    return this._subdelegates;
  }
}
