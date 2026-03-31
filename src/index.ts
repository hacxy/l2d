import './lib/cubism2.js';
import './lib/cubism5.js';
// eslint-disable-next-line perfectionist/sort-imports
import L2D from './l2d.js';

/**
 * Initialize L2D instance
 * @param canvasEl canvas element
 * @returns L2D instance
 */
export function init(canvasEl: HTMLCanvasElement | null) {
  if (!canvasEl) {
    throw new TypeError('Target element node not found.');
  }
  if (!(canvasEl instanceof HTMLCanvasElement)) {
    throw new TypeError('Target element node is not a canvas element.');
  }
  // 确保 canvas 元素在 DOM 中
  if (!canvasEl.isConnected) {
    document.body.appendChild(canvasEl);
  }

  return new L2D(canvasEl);
}
