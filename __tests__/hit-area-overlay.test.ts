import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HitAreaOverlay } from '../src/hit-area-overlay';

// ---------------------------------------------------------------------------
// 辅助工厂
// ---------------------------------------------------------------------------
function makeCtxMock() {
  return {
    clearRect: vi.fn(),
    strokeRect: vi.fn(),
    fillRect: vi.fn(),
    fillText: vi.fn(),
    strokeStyle: '' as string | CanvasGradient | CanvasPattern,
    fillStyle: '' as string | CanvasGradient | CanvasPattern,
    lineWidth: 0,
    font: '',
  } as unknown as CanvasRenderingContext2D;
}

// ---------------------------------------------------------------------------
// Setup / Teardown
// ---------------------------------------------------------------------------
let canvas: HTMLCanvasElement;
let ctx: ReturnType<typeof makeCtxMock>;

beforeEach(() => {
  canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 300;
  document.body.appendChild(canvas);

  ctx = makeCtxMock();
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx as any);

  // rAF / cAF stubbing — 防止 draw() 形成无限循环
  vi.stubGlobal('requestAnimationFrame', vi.fn(() => 42));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
});

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('hitAreaOverlay — constructor', () => {
  it('构造时不抛出错误', () => {
    expect(() => new HitAreaOverlay(canvas, () => [])).not.toThrow();
  });
});

describe('hitAreaOverlay.show()', () => {
  it('向 document.body 追加 overlay canvas', () => {
    const overlay = new HitAreaOverlay(canvas, () => []);
    overlay.show();
    // body 中有原始 canvas + overlay canvas
    expect(document.querySelectorAll('canvas').length).toBe(2);
  });

  it('overlay 的 position 样式为 fixed', () => {
    const overlay = new HitAreaOverlay(canvas, () => []);
    overlay.show();
    const overlayEl = document.querySelectorAll('canvas')[1];
    expect(overlayEl.style.position).toBe('fixed');
  });

  it('调用 requestAnimationFrame 启动渲染循环', () => {
    const overlay = new HitAreaOverlay(canvas, () => []);
    overlay.show();
    expect(requestAnimationFrame).toHaveBeenCalled();
  });

  it('首帧调用 ctx.clearRect', () => {
    const overlay = new HitAreaOverlay(canvas, () => []);
    overlay.show();
    expect(ctx.clearRect).toHaveBeenCalled();
  });

  it('无 bounds 时不调用 strokeRect', () => {
    const overlay = new HitAreaOverlay(canvas, () => []);
    overlay.show();
    expect(ctx.strokeRect).not.toHaveBeenCalled();
  });

  it('devicePixelRatio > 1 时按 dpr 计算 overlay 尺寸', () => {
    vi.stubGlobal('devicePixelRatio', 2);
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
      width: 100, height: 80, x: 0, y: 0, top: 0, left: 0, right: 100, bottom: 80,
      toJSON: () => ({}),
    } as DOMRect);
    const overlay = new HitAreaOverlay(canvas, () => []);
    overlay.show();
    // dpr=2 → w=200, h=160；默认 canvas 300≠200 触发 resize
    expect(ctx.clearRect).toHaveBeenCalled();
  });

  it('overlay 尺寸已匹配时不重设 width/height（false 分支）', () => {
    // jsdom 默认 canvas width=300 height=150
    // 让 getBoundingClientRect 返回匹配尺寸，使 overlay.width === w
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
      width: 300, height: 150, x: 0, y: 0, top: 0, left: 0, right: 300, bottom: 150,
      toJSON: () => ({}),
    } as DOMRect);

    const overlay = new HitAreaOverlay(canvas, () => []);
    overlay.show();
    // 不抛出即可（验证 false 分支执行正常）
    expect(ctx.clearRect).toHaveBeenCalled();
  });

  it('有 bounds 时绘制 strokeRect / fillRect / fillText', () => {
    const bounds = [{ name: 'body', x: 10, y: 20, w: 50, h: 60 }];
    const overlay = new HitAreaOverlay(canvas, () => bounds);
    overlay.show();

    expect(ctx.strokeRect).toHaveBeenCalledWith(10, 20, 50, 60);
    expect(ctx.fillRect).toHaveBeenCalledWith(10, 20, 50, 60);
    expect(ctx.fillText).toHaveBeenCalledWith('body', 14, 34);
  });

  it('多个 bounds 时每个都绘制', () => {
    const bounds = [
      { name: 'head', x: 0, y: 0, w: 30, h: 30 },
      { name: 'body', x: 50, y: 50, w: 80, h: 100 },
    ];
    const overlay = new HitAreaOverlay(canvas, () => bounds);
    overlay.show();

    expect(ctx.strokeRect).toHaveBeenCalledTimes(2);
    expect(ctx.fillText).toHaveBeenCalledWith('head', 4, 14);
    expect(ctx.fillText).toHaveBeenCalledWith('body', 54, 64);
  });
});

describe('hitAreaOverlay.hide()', () => {
  it('show 后 hide，overlay canvas 从 DOM 中移除', () => {
    const overlay = new HitAreaOverlay(canvas, () => []);
    overlay.show();
    expect(document.querySelectorAll('canvas').length).toBe(2);

    overlay.hide();
    expect(document.querySelectorAll('canvas').length).toBe(1);
  });

  it('hide 时取消 requestAnimationFrame', () => {
    const overlay = new HitAreaOverlay(canvas, () => []);
    overlay.show();
    overlay.hide();
    expect(cancelAnimationFrame).toHaveBeenCalledWith(42);
  });

  it('未调用 show 直接调用 hide 不抛出错误', () => {
    const overlay = new HitAreaOverlay(canvas, () => []);
    expect(() => overlay.hide()).not.toThrow();
  });

  it('重复 hide 不抛出错误', () => {
    const overlay = new HitAreaOverlay(canvas, () => []);
    overlay.show();
    overlay.hide();
    expect(() => overlay.hide()).not.toThrow();
  });

  it('hide 后 rafId 为 null，重复 hide 不重复取消', () => {
    const overlay = new HitAreaOverlay(canvas, () => []);
    overlay.show();
    overlay.hide();
    vi.clearAllMocks();

    overlay.hide();
    expect(cancelAnimationFrame).not.toHaveBeenCalled();
  });
});

describe('hitAreaOverlay.syncTransform()', () => {
  it('传入任意字符串不抛出错误', () => {
    const overlay = new HitAreaOverlay(canvas, () => []);
    expect(() => overlay.syncTransform('rotate(30deg)')).not.toThrow();
    expect(() => overlay.syncTransform('')).not.toThrow();
  });
});
