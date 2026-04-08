import type { ModelState } from './motion-controller.js';
import type { Options } from './types.js';
import Cubism2Model from './cubism2/index.js';
import { AppDelegate as Cubism6Model } from './cubism6/index.js';
import { checkModelVersion } from './utils/model.js';

export interface LoadContext {
  canvas: HTMLCanvasElement
  state: ModelState
  resize: () => void
  emit: (event: 'loaded') => void
  replaceCanvas: () => void
}

export async function loadModel(ctx: LoadContext, options: Options): Promise<void> {
  const { canvas, state } = ctx;
  const prevVersion = state.currentVersion;

  if (state.l2d2Model) {
    state.l2d2Model.destroy();
    state.l2d2Model = null;
  }
  if (state.l2d6Model) {
    state.l2d6Model.release();
    state.l2d6Model = null;
  }
  state.currentVersion = null;

  const res = await fetch(options.path);
  if (!res.ok) {
    console.error(`获取模型配置失败: ${res.statusText}`);
    return;
  }
  const result = await res.json();
  const version = checkModelVersion(result);

  if (prevVersion !== null && prevVersion !== version)
    ctx.replaceCanvas();

  state.currentVersion = version;

  if (version === 2) {
    const model = new Cubism2Model(ctx.canvas);
    state.l2d2Model = model;
    await model.init(canvas, options.path, result);
    if (options.position)
      model.setPosition(options.position[0], options.position[1]);
    ctx.resize();
    model.setScale(resolveScale(canvas, options.scale, 2));
    ctx.emit('loaded');
  }
  else {
    const model = new Cubism6Model(ctx.canvas);
    state.l2d6Model = model;
    if (!model.initialize()) {
      console.error('Failed to initialize Cubism6 model');
      return;
    }
    if (options.position)
      model.setPosition(options.position[0], options.position[1]);
    model.changeModel(options.path);
    model.run();
    await new Promise<void>(resolve => {
      model.onLoaded(() => {
        ctx.resize();
        model.setScale(resolveScale(ctx.canvas, options.scale, version));
        ctx.emit('loaded');
        resolve();
      });
    });
  }
}

export function resolveScale(canvas: HTMLCanvasElement, scale: number | 'auto' | null | void, version: number): number {
  if (typeof scale === 'number')
    return scale;
  const w = canvas.width;
  const h = canvas.height;
  if (w === h)
    return 1;
  // Cubism 3+ (Cubism6) view X: ±(w/h), Y: ±1 — portrait causes horizontal overflow
  // Cubism2 view X: ±1, Y: ±(h/w) — landscape causes vertical overflow
  return version !== 2
    ? Math.min(1, w / h)
    : Math.min(1, h / w);
}
