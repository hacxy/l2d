import '../lib/cubism2.js';
// eslint-disable-next-line perfectionist/sort-imports
import '../lib/cubism5.js';
// eslint-disable-next-line perfectionist/sort-imports
import { L2D } from './l2d.js';

export function init(el: HTMLElement | null) {
  if (!el) {
    console.error('Target element node not found.');
  }
  const l2d = new L2D(el!);
  return l2d;
}
