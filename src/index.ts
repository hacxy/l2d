import '../lib/cubism2.js';
// eslint-disable-next-line perfectionist/sort-imports
import '../lib/cubism5.js';
// eslint-disable-next-line perfectionist/sort-imports
import { L2D } from './l2d.js';

export type { L2D } from './l2d.js';
export type * from './types.js';

export function init(canvasEl: HTMLCanvasElement | null) {
  if (!canvasEl) {
    console.error('Target element node not found.');
  }
  const l2d = new L2D(canvasEl!);
  return l2d;
}
