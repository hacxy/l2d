import type { ModelState } from './motion-controller.js';
import type { Options } from './types.js';
import logger from './logger.js';
import { checkModelVersion } from './utils/model.js';
import Cubism2Model from './vendor/cubism2/index.js';
import { AppDelegate as Cubism6Model } from './vendor/cubism6/index.js';

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

  let res: Response;
  try {
    res = await fetch(options.path);
  }
  catch (e) {
    logger.error(`Failed to fetch model config: ${options.path}`, e);
    return;
  }
  if (!res.ok) {
    logger.error(`Failed to load model config: ${res.status} ${res.statusText} (${options.path})`);
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
    try {
      await model.init(canvas, options.path, result);
    }
    catch (e) {
      logger.error('Failed to initialize Cubism2 model.', e);
      return;
    }
    if (options.position)
      model.setPosition(options.position[0], options.position[1]);
    ctx.resize();
    if (typeof options.scale === 'number')
      model.setScale(options.scale);
    ctx.emit('loaded');
  }
  else {
    const model = new Cubism6Model(ctx.canvas);
    state.l2d6Model = model;
    if (!model.initialize()) {
      logger.error('Failed to initialize Cubism6 model');
      return;
    }
    if (typeof options.scale === 'number') {
      model.setScale(options.scale);
    }
    if (options.position) {
      model.setPosition(options.position[0], options.position[1]);
    }
    model.changeModel(options.path);
    model.run();
    await new Promise<void>(resolve => {
      model.onLoaded(() => {
        ctx.resize();
        ctx.emit('loaded');
        resolve();
      });
    });
  }
}
