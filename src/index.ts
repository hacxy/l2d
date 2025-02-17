import '../lib/cubism2.js';
// eslint-disable-next-line perfectionist/sort-imports
import '../lib/cubism5.js';
// eslint-disable-next-line perfectionist/sort-imports
import { L2D } from './l2d.js';

export type { L2D } from './l2d.js';
export type * from './model.js';
export type * from './types.js';

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
  const l2d = new L2D(canvasEl!);
  return l2d;
}
