/* eslint-disable perfectionist/sort-imports */
import './vendor/lib/cubism2.js';
import './vendor/lib/live2dcubismcore.js';
import L2D from './l2d.js';
import logger from './logger.js';

declare const __VERSION__: string;

/**
 * Initialize L2D instance
 * @param canvasEl canvas element
 * @returns L2D instance
 */
console.log(
  `%c            /\\_/\\\n           ( o.o )\n            > ^ <\n\n Welcome to l2d!  v${__VERSION__}`,
  'color: #f472b6; line-height: 1.6; font-family: monospace;',
);

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
export type { L2DEventMap, Options } from './types.js';

export type {
  L2D
};
