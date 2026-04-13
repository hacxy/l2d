import { afterEach, describe, expect, it } from 'vitest';
import { ensureCanvasElementInDOM } from '../../src/utils/dom';
import { checkModelVersion } from '../../src/utils/model';

// ---------------------------------------------------------------------------
// checkModelVersion
// ---------------------------------------------------------------------------

describe('checkModelVersion()', () => {
  it('有 Version 字段时返回其值（Cubism5）', () => {
    expect(checkModelVersion({ Version: 3, FileReferences: {} })).toBe(3);
  });

  it('version 为 5 时返回 5', () => {
    expect(checkModelVersion({ Version: 5 })).toBe(5);
  });

  it('有 FileReferences 但无 Version 时返回 3', () => {
    // Version 缺失 → undefined → falsy，走 `undefined || 3`
    expect(checkModelVersion({ FileReferences: { Moc: 'a.moc3' } })).toBe(3);
  });

  it('无 Version 和 FileReferences 时返回 2（Cubism2）', () => {
    expect(checkModelVersion({ model: 'test.moc' })).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// ensureCanvasElementInDOM
// ---------------------------------------------------------------------------

describe('ensureCanvasElementInDOM()', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('传入 null 时抛出 TypeError', () => {
    expect(() => ensureCanvasElementInDOM(null)).toThrow(TypeError);
    expect(() => ensureCanvasElementInDOM(null)).toThrow('Target element node not found.');
  });

  it('传入非 canvas 元素时抛出 TypeError', () => {
    const div = document.createElement('div');
    expect(() => ensureCanvasElementInDOM(div as unknown as HTMLCanvasElement)).toThrow(TypeError);
    expect(() => ensureCanvasElementInDOM(div as unknown as HTMLCanvasElement)).toThrow('not a canvas element');
  });

  it('canvas 未连接时自动挂载到 document.body', () => {
    const canvas = document.createElement('canvas');
    expect(canvas.isConnected).toBe(false);
    ensureCanvasElementInDOM(canvas);
    expect(canvas.isConnected).toBe(true);
  });

  it('canvas 已连接时直接返回，不重复挂载', () => {
    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    const childCount = document.body.children.length;
    ensureCanvasElementInDOM(canvas);
    expect(document.body.children.length).toBe(childCount);
  });

  it('返回值是传入的 canvas 元素本身', () => {
    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    expect(ensureCanvasElementInDOM(canvas)).toBe(canvas);
  });
});
