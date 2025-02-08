import '../lib/cubism2.js';
// eslint-disable-next-line perfectionist/sort-imports
import '../lib/cubism5.js';
// eslint-disable-next-line perfectionist/sort-imports
import { L2D } from './l2d.js';

export type { L2D } from './l2d.js';
export type * from './types.js';

// eslint-disable-next-line no-console
const originalConsoleLog = console.log;

// eslint-disable-next-line no-console
console.log = function (...args) {
  // 检查第一个参数是否是字符串并且以 [CSM] 开头
  if (typeof args[0] === 'string') {
    if (args[0].startsWith('[CSM]')) {
      return void 0;
    }
    else {
      originalConsoleLog.apply(console, args);
    }
  }
};

export function init(el: HTMLElement | null) {
  if (!el) {
    console.error('Target element node not found.');
  }
  const l2d = new L2D(el!);
  return l2d;
}
