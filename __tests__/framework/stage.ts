import type { Options } from '../../dist';
import type { L2D } from '../demo-types';
import { init } from '../../dist';
import { copyPath } from './models';

const stageEl = document.getElementById('stage') as HTMLDivElement;

export function createInstance(): L2D {
  const wrapper = document.createElement('div');
  wrapper.className = 'canvas-wrapper';
  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 400;
  const overlay = document.createElement('div');
  overlay.className = 'canvas-loading';
  overlay.innerHTML = '<div class="spinner"></div><span class="loading-text">Loading...</span><div class="loading-track"><div class="loading-bar"></div></div>';
  wrapper.appendChild(canvas);
  wrapper.appendChild(overlay);

  const text = overlay.querySelector('.loading-text') as HTMLSpanElement;
  const bar = overlay.querySelector('.loading-bar') as HTMLDivElement;

  const pathEl = document.createElement('div');
  pathEl.className = 'canvas-path';
  pathEl.textContent = '—';

  const item = document.createElement('div');
  item.className = 'canvas-item';
  item.appendChild(wrapper);
  item.appendChild(pathEl);
  stageEl.appendChild(item);

  const l2d = init(canvas);

  l2d.on('loadstart', total => {
    overlay.classList.remove('done');
    text.textContent = `0 / ${total}`;
    bar.style.width = '0%';
  });

  l2d.on('loadprogress', (loaded, total) => {
    text.textContent = `${loaded} / ${total}`;
    bar.style.width = `${Math.round((loaded / total) * 100)}%`;
    if (loaded >= total)
      setTimeout(() => overlay.classList.add('done'), 300);
  });

  const origLoad = l2d.load.bind(l2d);
  l2d.load = (opts: Options) => {
    pathEl.textContent = opts.path;
    pathEl.classList.add('has-path');
    pathEl.onclick = () => copyPath(opts.path);
    return origLoad(opts);
  };
  return l2d;
}

export function clearStage(): void {
  stageEl.innerHTML = '';
}

export function appendErrorToStage(msg: string): void {
  const errEl = document.createElement('div');
  errEl.className = 'error-msg';
  errEl.textContent = msg;
  stageEl.appendChild(errEl);
}
