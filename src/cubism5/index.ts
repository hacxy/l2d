// @ts-nocheck
import logger from '../logger.js';
import * as LAppDefine from './framework/lappdefine.js';
import { LAppDelegate } from './framework/lappdelegate.js';
import { LAppModel } from './framework/lappmodel.js';
import { LAppPal } from './framework/lapppal.js';
import { LAppSubdelegate } from './framework/lappsubdelegate.js';

LAppPal.printMessage = () => {};

// Ensure LAppPal.updateTime() is called only once per animation frame across all instances
let _lastUpdateTimestamp = -1;
function updateTimeOnce(timestamp: number) {
  if (timestamp !== _lastUpdateTimestamp) {
    _lastUpdateTimestamp = timestamp;
    LAppPal.updateTime();
  }
}

// Custom subdelegate class, responsible for Canvas-related initialization and rendering management
class AppSubdelegate extends LAppSubdelegate {
  _userScale: number | undefined;
  _userPosition: [number, number] | undefined;

  /**
   * Initialize resources required by the application.
   */
  public initialize(canvas: HTMLCanvasElement): boolean {
    if (!this._glManager.initialize(canvas)) {
      return false;
    }

    this._canvas = canvas;

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
    this._view._gear = { render: () => {}, isHit: () => {}, release: () => {} };
    this._view._back = { render: () => {}, release: () => {} };

    this._live2dManager._subdelegate = this;

    this._resizeObserver = new window.ResizeObserver(
      (entries: ResizeObserverEntry[], observer: ResizeObserver) =>
        this.resizeObserverCallback.call(this, entries, observer)
    );
    this._resizeObserver.observe(this._canvas);

    return true;
  }

  /**
   * Adjust and reinitialize the view when the canvas size changes
   */
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

  /**
   * Main render loop, called periodically to update the screen
   */
  public update(): void {
    if (this._glManager.getGl().isContextLost()) {
      return;
    }

    if (this._needResize) {
      this.onResize();
      this._needResize = false;
    }

    const gl: WebGL2RenderingContext = this._glManager.getGl();

    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clearDepth(1.0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    this._view.render();
  }
}

// Main application delegate class, responsible for managing the main loop, canvas, model switching, and other global logic
export class AppDelegate extends LAppDelegate {
  _canvas: HTMLCanvasElement;
  _drawFrameId: number | null = null;
  _modelLoadedEmitted: boolean = false;
  _onLoaded: (() => void) | null = null;
  _expressionWasPlaying: boolean = false;

  public constructor(canvas: HTMLCanvasElement) {
    super();
    this._canvas = canvas;
  }

  /**
   * Start the main loop.
   */
  public run(): void {
    const loop = (timestamp: number) => {
      updateTimeOnce(timestamp);

      for (let i = 0; i < this._subdelegates.getSize(); i++) {
        this._subdelegates.at(i).update();
      }

      if (!this._modelLoadedEmitted && this._isModelReady()) {
        this._modelLoadedEmitted = true;
        if (this._onLoaded) {
          this._onLoaded();
        }
      }

      // Detect expression end
      const model = this._subdelegates.at(0)?.getLive2DManager()?._models.at(0);
      if (model) {
        const exprFinished = model._expressionManager?.isFinished();
        if (!this._expressionWasPlaying && exprFinished === false) {
          this._expressionWasPlaying = true;
        }
        else if (this._expressionWasPlaying && exprFinished === true) {
          this._expressionWasPlaying = false;
          window.dispatchEvent(new CustomEvent('live2d:expressionend', { detail: { canvas: this._canvas } }));
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
    this.stop();
    this.releaseEventListener();
    for (let i = 0; i < this._subdelegates.getSize(); i++) {
      this._subdelegates.at(i).release();
    }
    this._subdelegates.clear();
    this._cubismOption = null;
  }

  private transformOffset(e: MouseEvent | PointerEvent): { x: number; y: number } {
    const subdelegate = this._subdelegates.at(0);
    const canvas = subdelegate.getCanvas();
    const rect: DOMRect = canvas.getBoundingClientRect();
    const posX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const posY = (e.clientY - rect.top) * (canvas.height / rect.height);
    const x: number = subdelegate._view.transformViewX(posX);
    const y: number = subdelegate._view.transformViewY(posY);
    return { x, y };
  }

  private _isModelReady(): boolean {
    const manager = this._subdelegates.at(0)?.getLive2DManager();
    const model = manager?._models.at(0);
    // LoadStep.CompleteSetup === 22, only at this point textures are bound and model renders
    return model?._state === 22;
  }

  private onMouseMove(e: MouseEvent): void {
    if (!this._isModelReady()) return;
    const canvas = this._subdelegates.at(0).getCanvas();
    const rect = canvas.getBoundingClientRect();
    const inCanvas = e.clientX >= rect.left && e.clientX <= rect.right
      && e.clientY >= rect.top && e.clientY <= rect.bottom;
    const lapplive2dmanager = this._subdelegates.at(0).getLive2DManager();
    const { x, y } = this.transformOffset(e);
    const model = lapplive2dmanager._models.at(0);

    lapplive2dmanager.onDrag(x, y);
    if (!inCanvas) return;
    const hoverCount: number = model._modelSetting.getHitAreasCount();
    for (let i = 0; i < hoverCount; i++) {
      const areaName: string = model._modelSetting.getHitAreaName(i);
      if (model.hitTest(areaName, x, y)) {
        window.dispatchEvent(new CustomEvent('live2d:hoverbody', {
          detail: { canvas: this._canvas, areaName }
        }));
      }
    }
  }

  private onMouseEnd(e: MouseEvent): void {
    if (!this._isModelReady()) return;
    const lapplive2dmanager = this._subdelegates.at(0).getLive2DManager();
    const { x, y } = this.transformOffset(e);
    lapplive2dmanager.onDrag(0.0, 0.0);
    lapplive2dmanager.onTap(x, y);
  }

  private onTap(e: PointerEvent): void {
    if (!this._isModelReady()) return;
    const lapplive2dmanager = this._subdelegates.at(0).getLive2DManager();
    const { x, y } = this.transformOffset(e);
    const model = lapplive2dmanager._models.at(0);
    const count: number = model._modelSetting.getHitAreasCount();

    for (let i = 0; i < count; i++) {
      const areaName: string = model._modelSetting.getHitAreaName(i);
      if (model.hitTest(areaName, x, y)) {
        window.dispatchEvent(new CustomEvent('live2d:tapbody', {
          detail: { canvas: this._canvas, areaName }
        }));
      }
    }
    lapplive2dmanager.onTap(x, y);
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
    document.removeEventListener('mousemove', this.mouseMoveEventListener, { passive: true });
    this.mouseMoveEventListener = null;
    document.removeEventListener('mouseout', this.mouseEndedEventListener, { passive: true });
    this.mouseEndedEventListener = null;
    document.removeEventListener('pointerdown', this.tapEventListener, { passive: true });
    this.tapEventListener = null;
  }

  public initialize(): boolean {
    return super.initialize();
  }

  /**
   * Create canvas and initialize all Subdelegates
   */
  public initializeSubdelegates(): void {
    this._canvases.prepareCapacity(LAppDefine.CanvasNum);
    this._subdelegates.prepareCapacity(LAppDefine.CanvasNum);

    const canvas = this._canvas;
    this._canvases.pushBack(canvas);

    canvas.style.width = String(canvas.width);
    canvas.style.height = String(canvas.height);

    for (let i = 0; i < this._canvases.getSize(); i++) {
      const subdelegate = new AppSubdelegate();
      const result = subdelegate.initialize(this._canvases.at(i));
      if (!result) {
        logger.error('Failed to initialize AppSubdelegate');
        return;
      }
      this._subdelegates.pushBack(subdelegate);
    }

    for (let i = 0; i < LAppDefine.CanvasNum; i++) {
      if (this._subdelegates.at(i).isContextLost()) {
        logger.error(
          `The context for Canvas at index ${i} was lost, possibly because the acquisition limit for WebGLRenderingContext was reached.`
        );
      }
    }
  }

  /**
   * Switch model
   */
  public changeModel(modelSettingPath: string): void {
    this._modelLoadedEmitted = false;
    const segments = modelSettingPath.split('/');
    const modelJsonName = segments.pop();
    const modelPath = `${segments.join('/')}/`;
    const live2dManager = this._subdelegates.at(0).getLive2DManager();
    live2dManager.releaseAllModel();
    const instance = new LAppModel();
    instance.setSubdelegate(live2dManager._subdelegate);
    instance._onModelFileLoaded = () => window.dispatchEvent(new CustomEvent('live2d:modelfileloaded', { detail: { canvas: this._canvas } }));
    instance._onTexturesLoaded = () => window.dispatchEvent(new CustomEvent('live2d:texturesloaded', { detail: { canvas: this._canvas } }));
    instance._onLoadStart = (total: number) => window.dispatchEvent(new CustomEvent('live2d:loadstart', { detail: { canvas: this._canvas, total } }));
    instance._onProgress = (loaded: number, total: number, file: string) => window.dispatchEvent(new CustomEvent('live2d:loadprogress', { detail: { canvas: this._canvas, loaded, total, file } }));
    instance.loadAssets(modelPath, modelJsonName);
    live2dManager._models.pushBack(instance);
  }

  public setPosition(x: number, y: number): void {
    const subdelegate = this._subdelegates.at(0);
    subdelegate._userPosition = [x, y];
    const view = subdelegate._view;
    view._viewMatrix.translate(x, y);
    subdelegate.getLive2DManager().setViewMatrix(view._viewMatrix);
  }

  public setScale(scale: number): void {
    const subdelegate = this._subdelegates.at(0);
    subdelegate._userScale = scale;
    const view = subdelegate._view;
    view._viewMatrix.adjustScale(0, 0, scale);
    subdelegate.getLive2DManager().setViewMatrix(view._viewMatrix);
  }

  public resize(): void {
    const subdelegate = this._subdelegates.at(0);
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
        subdelegate._userPosition[1]
      );
    }
    subdelegate.getLive2DManager().setViewMatrix(subdelegate._view._viewMatrix);
  }

  public getHitAreaBounds(): Array<{ name: string; x: number; y: number; w: number; h: number }> {
    if (!this._isModelReady()) return [];
    const subdelegate = this._subdelegates.at(0);
    const model = subdelegate.getLive2DManager()._models.at(0);
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
    const model = this._subdelegates.at(0)?.getLive2DManager()?._models.at(0);
    if (!model) return;
    const onBegan = (_motion: any) => {
      window.dispatchEvent(new CustomEvent('live2d:motionstart', {
        detail: { canvas: this._canvas, group, index }
      }));
    };
    if (index === undefined) {
      model.startRandomMotion(group, priority, undefined, onBegan);
    }
    else {
      model.startMotion(group, index, priority, undefined, onBegan);
    }
  }

  public getMotionGroups(): Record<string, number> {
    const model = this._subdelegates.at(0)?.getLive2DManager()?._models.at(0);
    if (!model?._modelSetting) return {};
    const result: Record<string, number> = {};
    const count: number = model._modelSetting.getMotionGroupCount();
    for (let i = 0; i < count; i++) {
      const name: string = model._modelSetting.getMotionGroupName(i);
      result[name] = model._modelSetting.getMotionCount(name);
    }
    return result;
  }

  public setExpression(id?: string): void {
    const model = this._subdelegates.at(0)?.getLive2DManager()?._models.at(0);
    if (!model) return;
    if (id) {
      model.setExpression(id);
    }
    else {
      if (model._expressions.getSize() === 0) return;
      const no = Math.floor(Math.random() * model._expressions.getSize());
      id = model._expressions._keyValues[no].first;
      model.setExpression(id);
    }
    window.dispatchEvent(new CustomEvent('live2d:expressionstart', {
      detail: { canvas: this._canvas, id }
    }));
  }

  public getExpressions(): string[] {
    const model = this._subdelegates.at(0)?.getLive2DManager()?._models.at(0);
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
