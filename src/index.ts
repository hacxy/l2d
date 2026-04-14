/* eslint-disable perfectionist/sort-imports */
import './vendor/lib/cubism2.js';
import './vendor/lib/live2dcubismcore.js';
import L2D from './l2d.js';
import logger from './logger.js';

/**
 * Initialize L2D instance
 * @param canvasEl canvas element
 * @returns L2D instance
 */

export function init(canvasEl: HTMLCanvasElement): L2D;
export function init(canvasEl: HTMLCanvasElement | null): L2D | null;
export function init(canvasEl: HTMLCanvasElement | null): L2D | null {
  if (!canvasEl) {
    logger.error('Target element node not found.');
    return null;
  }
  if (!(canvasEl instanceof HTMLCanvasElement)) {
    logger.error('Target element node is not a canvas element.');
    return null;
  }
  return new L2D(canvasEl);
}
export type { L2DEventMap, Options, ParamInfo } from './types.js';

export type {
  L2D
};
