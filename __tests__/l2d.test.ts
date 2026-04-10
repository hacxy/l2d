/* eslint-disable max-lines */
/* eslint-disable style/max-statements-per-line */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// ---------------------------------------------------------------------------
// 定义 hoisted mock 工厂（vi.mock 会被提升到文件顶部，需提前声明 mock 实例）
// ---------------------------------------------------------------------------
const mockHitAreaOverlayInstance = vi.hoisted(() => ({
  show: vi.fn(),
  hide: vi.fn(),
  syncTransform: vi.fn(),
}));

const mockCubism5Instance = vi.hoisted(() => ({
  initialize: vi.fn(() => true),
  changeModel: vi.fn(),
  run: vi.fn(),
  onLoaded: vi.fn((cb: () => void) => cb()),
  release: vi.fn(),
  resize: vi.fn(),
  setScale: vi.fn(),
  setPosition: vi.fn(),
  setParams: vi.fn(),
  setExpression: vi.fn(),
  getExpressions: vi.fn(() => ['happy', 'angry']),
  playMotion: vi.fn(),
  getMotionGroups: vi.fn(() => ({ Idle: 3, Tap: 2 })),
  getMotionFiles: vi.fn(() => ({ Idle: ['motions/idle_0.motion3.json', 'motions/idle_1.motion3.json', 'motions/idle_2.motion3.json'], Tap: ['motions/tap_0.motion3.json', 'motions/tap_1.motion3.json'] })),
  getHitAreaBounds: vi.fn(() => []),
}));

const mockCubism2Instance = vi.hoisted(() => ({
  // eslint-disable-next-line no-undefined
  init: vi.fn().mockResolvedValue(undefined),
  destroy: vi.fn(),
  resize: vi.fn(),
  setScale: vi.fn(),
  setPosition: vi.fn(),
  setParams: vi.fn(),
  setExpression: vi.fn(),
  getExpressions: vi.fn(() => ['blink']),
  playMotion: vi.fn(),
  getMotionGroups: vi.fn(() => ({ Idle: 2 })),
  getMotionFiles: vi.fn(() => ({ Idle: ['motions/idle_0.mtn', 'motions/idle_1.mtn'] })),
  getHitAreaBounds: vi.fn(() => []),
}));

// ---------------------------------------------------------------------------
// 模块 mock
// ---------------------------------------------------------------------------

// 浏览器 SDK 副作用 import，在 jsdom 中直接忽略
vi.mock('../src/lib/cubism2.js', () => ({}));
vi.mock('../src/lib/live2dcubismcore.js', () => ({}));

// Arrow functions cannot be used as constructors (`new ArrowFn()` throws).
// Regular function declarations return the mock instance via the JS spec:
// if a constructor returns an object, `new Ctor()` yields that object.
vi.mock('../src/hit-area-overlay.ts', () => {
  function HitAreaOverlay() { return mockHitAreaOverlayInstance; }
  return { HitAreaOverlay };
});

vi.mock('../src/cubism6/index.ts', () => {
  function AppDelegate() { return mockCubism5Instance; }
  return { AppDelegate };
});

vi.mock('../src/cubism2/index.js', () => {
  function Cubism2Model() { return mockCubism2Instance; }
  return { default: Cubism2Model };
});

// ---------------------------------------------------------------------------
// 通用 canvas 构造工具
// ---------------------------------------------------------------------------
function makeCanvas(connected = true): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 600;
  if (connected)
    document.body.appendChild(canvas);
  return canvas;
}

function makeFetchMock(payload: object) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(payload),
  } as unknown as Response);
}

// Cubism5 model JSON（Version 字段触发 5.x 分支）
const CUBISM5_JSON = { Version: 3, FileReferences: { Moc: 'test.moc3' } };
// Cubism2 model JSON（无 Version / FileReferences 字段，触发 2.x 分支）
const CUBISM2_JSON = { model: 'test.moc' };

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('init()', () => {
  it('传入 null 时返回 null', async () => {
    const { init } = await import('../src/index.ts');
    expect(init(null)).toBeNull();
  });

  it('传入非 canvas 元素时返回 null', async () => {
    const { init } = await import('../src/index.ts');
    const div = document.createElement('div');
    expect(init(div as unknown as HTMLCanvasElement)).toBeNull();
  });

  it('传入有效 canvas 时返回 L2D 实例', async () => {
    const { init } = await import('../src/index.ts');
    const canvas = makeCanvas();
    const l2d = init(canvas);
    expect(l2d).toBeDefined();
    expect(typeof l2d.load).toBe('function');
    expect(typeof l2d.on).toBe('function');
  });
});

describe('l2D — 未加载模型时的守卫行为', () => {
  let canvas: HTMLCanvasElement;

  beforeEach(async () => {
    canvas = makeCanvas();
    const { init } = await import('../src/index.ts');
    // 使用 let 保持实例引用；这里借 canvas 验证 init 不抛出
    init(canvas);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  it('getMotionGroups() 未加载时返回空对象', async () => {
    const { init } = await import('../src/index.ts');
    const l2d = init(makeCanvas());
    expect(l2d.getMotionGroups()).toEqual({});
  });

  it('getExpressions() 未加载时返回空数组', async () => {
    const { init } = await import('../src/index.ts');
    const l2d = init(makeCanvas());
    expect(l2d.getExpressions()).toEqual([]);
  });

  it('showHitAreas(true) 未加载时不抛出错误', async () => {
    const { init } = await import('../src/index.ts');
    const l2d = init(makeCanvas());
    expect(() => l2d.showHitAreas(true)).not.toThrow();
  });

  it('playMotion() 未加载时不抛出错误', async () => {
    const { init } = await import('../src/index.ts');
    const l2d = init(makeCanvas());
    expect(() => l2d.playMotion('Idle', 0)).not.toThrow();
  });
});

describe('l2D.load() — Cubism5', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it('加载成功后触发 loaded 事件', async () => {
    vi.stubGlobal('fetch', makeFetchMock(CUBISM5_JSON));
    const { init } = await import('../src/index.ts');
    const canvas = makeCanvas();
    const l2d = init(canvas);

    const onLoaded = vi.fn();
    l2d.on('loaded', onLoaded);
    await l2d.load({ path: '/models/test.model3.json' });

    expect(onLoaded).toHaveBeenCalledOnce();
  });

  it('加载后 getMotionGroups() 返回模型数据', async () => {
    vi.stubGlobal('fetch', makeFetchMock(CUBISM5_JSON));
    const { init } = await import('../src/index.ts');
    const canvas = makeCanvas();
    const l2d = init(canvas);

    await l2d.load({ path: '/models/test.model3.json' });
    expect(l2d.getMotionGroups()).toEqual({ Idle: 3, Tap: 2 });
  });

  it('加载后 getExpressions() 返回表情列表', async () => {
    vi.stubGlobal('fetch', makeFetchMock(CUBISM5_JSON));
    const { init } = await import('../src/index.ts');
    const canvas = makeCanvas();
    const l2d = init(canvas);

    await l2d.load({ path: '/models/test.model3.json' });
    expect(l2d.getExpressions()).toEqual(['happy', 'angry']);
  });

  it('fetch 失败时不触发 loaded 事件', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, statusText: 'Not Found' }));
    const { init } = await import('../src/index.ts');
    const canvas = makeCanvas();
    const l2d = init(canvas);

    const onLoaded = vi.fn();
    l2d.on('loaded', onLoaded);
    await l2d.load({ path: '/models/missing.model3.json' });

    expect(onLoaded).not.toHaveBeenCalled();
  });

  it('传入 position 选项后调用 setPosition', async () => {
    vi.stubGlobal('fetch', makeFetchMock(CUBISM5_JSON));
    const { init } = await import('../src/index.ts');
    const canvas = makeCanvas();
    const l2d = init(canvas);

    await l2d.load({ path: '/models/test.model3.json', position: [0.5, -0.2] });
    expect(mockCubism5Instance.setPosition).toHaveBeenCalledWith(0.5, -0.2);
  });
});

describe('l2D.load() — Cubism2', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it('加载成功后触发 loaded 事件', async () => {
    vi.stubGlobal('fetch', makeFetchMock(CUBISM2_JSON));
    const { init } = await import('../src/index.ts');
    const canvas = makeCanvas();
    const l2d = init(canvas);

    const onLoaded = vi.fn();
    l2d.on('loaded', onLoaded);
    await l2d.load({ path: '/models/test.model.json' });

    expect(onLoaded).toHaveBeenCalledOnce();
  });

  it('加载后 getMotionGroups() 返回模型数据', async () => {
    vi.stubGlobal('fetch', makeFetchMock(CUBISM2_JSON));
    const { init } = await import('../src/index.ts');
    const canvas = makeCanvas();
    const l2d = init(canvas);

    await l2d.load({ path: '/models/test.model.json' });
    expect(l2d.getMotionGroups()).toEqual({ Idle: 2 });
  });
});

describe('l2D.destroy()', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it('destroy() 后 getMotionGroups() 返回空对象', async () => {
    vi.stubGlobal('fetch', makeFetchMock(CUBISM5_JSON));
    const { init } = await import('../src/index.ts');
    const canvas = makeCanvas();
    const l2d = init(canvas);
    await l2d.load({ path: '/models/test.model3.json' });

    l2d.destroy();
    expect(l2d.getMotionGroups()).toEqual({});
  });

  it('destroy() 后 getExpressions() 返回空数组', async () => {
    vi.stubGlobal('fetch', makeFetchMock(CUBISM5_JSON));
    const { init } = await import('../src/index.ts');
    const canvas = makeCanvas();
    const l2d = init(canvas);
    await l2d.load({ path: '/models/test.model3.json' });

    l2d.destroy();
    expect(l2d.getExpressions()).toEqual([]);
  });

  it('destroy() 调用底层模型的 release()', async () => {
    vi.stubGlobal('fetch', makeFetchMock(CUBISM5_JSON));
    const { init } = await import('../src/index.ts');
    const canvas = makeCanvas();
    const l2d = init(canvas);
    await l2d.load({ path: '/models/test.model3.json' });

    l2d.destroy();
    expect(mockCubism5Instance.release).toHaveBeenCalledOnce();
  });

  it('destroy() 触发 destroy 事件', async () => {
    vi.stubGlobal('fetch', makeFetchMock(CUBISM5_JSON));
    const { init } = await import('../src/index.ts');
    const canvas = makeCanvas();
    const l2d = init(canvas);
    await l2d.load({ path: '/models/test.model3.json' });

    const fn = vi.fn();
    l2d.on('destroy', fn);
    l2d.destroy();
    expect(fn).toHaveBeenCalledOnce();
  });
});

describe('l2D — CustomEvent 事件桥接', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it('window live2d:motionstart 触发 motionstart 事件', async () => {
    const { init } = await import('../src/index.ts');
    const canvas = makeCanvas();
    const l2d = init(canvas);

    const fn = vi.fn();
    l2d.on('motionstart', fn);

    window.dispatchEvent(new CustomEvent('live2d:motionstart', {
      detail: { canvas, group: 'Idle', index: 1, duration: 2000, file: 'motions/idle_01.motion3.json' },
    }));

    expect(fn).toHaveBeenCalledWith('Idle', 1, 2000, 'motions/idle_01.motion3.json');
  });

  it('live2d:motionstart 携带 null duration 时传递 null', async () => {
    const { init } = await import('../src/index.ts');
    const canvas = makeCanvas();
    const l2d = init(canvas);

    const fn = vi.fn();
    l2d.on('motionstart', fn);

    window.dispatchEvent(new CustomEvent('live2d:motionstart', {
      detail: { canvas, group: 'Tap', index: 0 },
    }));

    expect(fn).toHaveBeenCalledWith('Tap', 0, null, null);
  });

  it('live2d:motionend 触发 motionend 事件', async () => {
    const { init } = await import('../src/index.ts');
    const canvas = makeCanvas();
    const l2d = init(canvas);

    const fn = vi.fn();
    l2d.on('motionend', fn);

    window.dispatchEvent(new CustomEvent('live2d:motionend', {
      detail: { canvas, group: 'Idle', index: 0, file: 'motions/idle_01.motion3.json' },
    }));

    expect(fn).toHaveBeenCalledWith('Idle', 0, 'motions/idle_01.motion3.json');
  });

  it('live2d:motionend 不携带 file 时传递 null', async () => {
    const { init } = await import('../src/index.ts');
    const canvas = makeCanvas();
    const l2d = init(canvas);

    const fn = vi.fn();
    l2d.on('motionend', fn);

    window.dispatchEvent(new CustomEvent('live2d:motionend', {
      detail: { canvas, group: 'Idle', index: 0 },
    }));

    expect(fn).toHaveBeenCalledWith('Idle', 0, null);
  });

  it('live2d:expressionstart 触发 expressionstart 事件', async () => {
    const { init } = await import('../src/index.ts');
    const canvas = makeCanvas();
    const l2d = init(canvas);

    const fn = vi.fn();
    l2d.on('expressionstart', fn);

    window.dispatchEvent(new CustomEvent('live2d:expressionstart', {
      detail: { canvas, id: 'happy' },
    }));

    expect(fn).toHaveBeenCalledWith('happy');
  });

  it('live2d:expressionend 触发 expressionend 事件', async () => {
    const { init } = await import('../src/index.ts');
    const canvas = makeCanvas();
    const l2d = init(canvas);

    const fn = vi.fn();
    l2d.on('expressionend', fn);

    window.dispatchEvent(new CustomEvent('live2d:expressionend', {
      detail: { canvas },
    }));

    expect(fn).toHaveBeenCalledOnce();
  });

  it('live2d:tapbody 触发 tap 事件', async () => {
    const { init } = await import('../src/index.ts');
    const canvas = makeCanvas();
    const l2d = init(canvas);

    const fn = vi.fn();
    l2d.on('tap', fn);

    window.dispatchEvent(new CustomEvent('live2d:tapbody', {
      detail: { canvas, areaName: 'body' },
    }));

    expect(fn).toHaveBeenCalledWith('body');
  });

  it('live2d:loadstart 触发 loadstart 事件', async () => {
    const { init } = await import('../src/index.ts');
    const canvas = makeCanvas();
    const l2d = init(canvas);

    const fn = vi.fn();
    l2d.on('loadstart', fn);

    window.dispatchEvent(new CustomEvent('live2d:loadstart', {
      detail: { canvas, total: 5 },
    }));

    expect(fn).toHaveBeenCalledWith(5);
  });

  it('live2d:loadprogress 触发 loadprogress 事件', async () => {
    const { init } = await import('../src/index.ts');
    const canvas = makeCanvas();
    const l2d = init(canvas);

    const fn = vi.fn();
    l2d.on('loadprogress', fn);

    window.dispatchEvent(new CustomEvent('live2d:loadprogress', {
      detail: { canvas, loaded: 2, total: 5, file: 'model.moc3' },
    }));

    expect(fn).toHaveBeenCalledWith(2, 5, 'model.moc3');
  });

  it('其他 canvas 触发的事件不影响当前实例', async () => {
    const { init } = await import('../src/index.ts');
    const canvas1 = makeCanvas();
    const canvas2 = makeCanvas();
    const l2d1 = init(canvas1);
    init(canvas2);

    const fn = vi.fn();
    l2d1.on('tap', fn);

    // 用 canvas2 触发，l2d1 不应响应
    window.dispatchEvent(new CustomEvent('live2d:tapbody', {
      detail: { canvas: canvas2, areaName: 'head' },
    }));

    expect(fn).not.toHaveBeenCalled();
  });
});

describe('l2D.load() — Cubism5 补充分支', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it('initialize() 失败时不触发 loaded 事件', async () => {
    vi.stubGlobal('fetch', makeFetchMock(CUBISM5_JSON));
    mockCubism5Instance.initialize.mockReturnValueOnce(false);
    const { init } = await import('../src/index.ts');
    const canvas = makeCanvas();
    const l2d = init(canvas);

    const onLoaded = vi.fn();
    l2d.on('loaded', onLoaded);
    await l2d.load({ path: '/models/test.model3.json' });

    expect(onLoaded).not.toHaveBeenCalled();
  });

  it('传入数字 scale 时直接调用 setScale', async () => {
    vi.stubGlobal('fetch', makeFetchMock(CUBISM5_JSON));
    const { init } = await import('../src/index.ts');
    const canvas = makeCanvas();
    const l2d = init(canvas);

    await l2d.load({ path: '/models/test.model3.json', scale: 1.5 });
    expect(mockCubism5Instance.setScale).toHaveBeenCalledWith(1.5);
  });

  it('不传 scale 时不调用 setScale', async () => {
    vi.stubGlobal('fetch', makeFetchMock(CUBISM5_JSON));
    const { init } = await import('../src/index.ts');
    const canvas = makeCanvas();
    const l2d = init(canvas);

    await l2d.load({ path: '/models/test.model3.json' });
    expect(mockCubism5Instance.setScale).not.toHaveBeenCalled();
  });
});

describe('l2D.load() — Cubism2 补充分支', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it('传入 position 选项后调用 setPosition', async () => {
    vi.stubGlobal('fetch', makeFetchMock(CUBISM2_JSON));
    const { init } = await import('../src/index.ts');
    const canvas = makeCanvas();
    const l2d = init(canvas);

    await l2d.load({ path: '/models/test.model.json', position: [-0.1, 0.3] });
    expect(mockCubism2Instance.setPosition).toHaveBeenCalledWith(-0.1, 0.3);
  });

  it('传入数字 scale 时直接调用 setScale', async () => {
    vi.stubGlobal('fetch', makeFetchMock(CUBISM2_JSON));
    const { init } = await import('../src/index.ts');
    const canvas = makeCanvas();
    const l2d = init(canvas);

    await l2d.load({ path: '/models/test.model.json', scale: 0.8 });
    expect(mockCubism2Instance.setScale).toHaveBeenCalledWith(0.8);
  });

  it('加载后 getExpressions() 返回表情列表', async () => {
    vi.stubGlobal('fetch', makeFetchMock(CUBISM2_JSON));
    const { init } = await import('../src/index.ts');
    const canvas = makeCanvas();
    const l2d = init(canvas);

    await l2d.load({ path: '/models/test.model.json' });
    expect(l2d.getExpressions()).toEqual(['blink']);
  });
});

describe('l2D.load() — 版本切换替换 canvas', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it('从 Cubism5 切换到 Cubism2 时 canvas 被替换', async () => {
    const { init } = await import('../src/index.ts');
    const canvas = makeCanvas();
    const l2d = init(canvas);

    vi.stubGlobal('fetch', makeFetchMock(CUBISM5_JSON));
    await l2d.load({ path: '/models/test.model3.json' });

    vi.stubGlobal('fetch', makeFetchMock(CUBISM2_JSON));
    await l2d.load({ path: '/models/test.model.json' });

    // 版本切换后旧 canvas 被 replaceChild 替换，原始引用已不在 DOM
    expect(canvas.isConnected).toBe(false);
  });

  it('同版本二次 load 不替换 canvas', async () => {
    vi.stubGlobal('fetch', makeFetchMock(CUBISM5_JSON));
    const { init } = await import('../src/index.ts');
    const canvas = makeCanvas();
    const l2d = init(canvas);

    await l2d.load({ path: '/models/test.model3.json' });
    await l2d.load({ path: '/models/test.model3.json' });

    expect(canvas.isConnected).toBe(true);
  });
});

describe('l2D.resize()', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it('cubism5 加载后 resize() 调用底层 resize', async () => {
    vi.stubGlobal('fetch', makeFetchMock(CUBISM5_JSON));
    const { init } = await import('../src/index.ts');
    const canvas = makeCanvas();
    const l2d = init(canvas);
    await l2d.load({ path: '/models/test.model3.json' });

    vi.clearAllMocks();
    l2d.resize();
    expect(mockCubism5Instance.resize).toHaveBeenCalledOnce();
  });

  it('cubism2 加载后 resize() 调用底层 resize', async () => {
    vi.stubGlobal('fetch', makeFetchMock(CUBISM2_JSON));
    const { init } = await import('../src/index.ts');
    const canvas = makeCanvas();
    const l2d = init(canvas);
    await l2d.load({ path: '/models/test.model.json' });

    vi.clearAllMocks();
    l2d.resize();
    expect(mockCubism2Instance.resize).toHaveBeenCalledOnce();
  });

  it('未加载时 resize() 不抛出错误', async () => {
    const { init } = await import('../src/index.ts');
    const l2d = init(makeCanvas());
    expect(() => l2d.resize()).not.toThrow();
  });
});

describe('l2D.setExpression()', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it('cubism5 加载后 setExpression() 调用底层', async () => {
    vi.stubGlobal('fetch', makeFetchMock(CUBISM5_JSON));
    const { init } = await import('../src/index.ts');
    const canvas = makeCanvas();
    const l2d = init(canvas);
    await l2d.load({ path: '/models/test.model3.json' });

    l2d.setExpression('happy');
    expect(mockCubism5Instance.setExpression).toHaveBeenCalledWith('happy');
  });

  it('cubism2 加载后 setExpression() 调用底层', async () => {
    vi.stubGlobal('fetch', makeFetchMock(CUBISM2_JSON));
    const { init } = await import('../src/index.ts');
    const canvas = makeCanvas();
    const l2d = init(canvas);
    await l2d.load({ path: '/models/test.model.json' });

    l2d.setExpression('blink');
    expect(mockCubism2Instance.setExpression).toHaveBeenCalledWith('blink');
  });

  it('未加载时 setExpression() 不抛出错误', async () => {
    const { init } = await import('../src/index.ts');
    const l2d = init(makeCanvas());
    expect(() => l2d.setExpression('happy')).not.toThrow();
  });
});

describe('l2D.playMotion() — 加载后', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it('cubism5 加载后 playMotion() 调用底层', async () => {
    vi.stubGlobal('fetch', makeFetchMock(CUBISM5_JSON));
    const { init } = await import('../src/index.ts');
    const canvas = makeCanvas();
    const l2d = init(canvas);
    await l2d.load({ path: '/models/test.model3.json' });

    l2d.playMotion('Idle', 0, 2);
    expect(mockCubism5Instance.playMotion).toHaveBeenCalledWith('Idle', 0, 2);
  });

  it('cubism2 加载后 playMotion() 调用底层', async () => {
    vi.stubGlobal('fetch', makeFetchMock(CUBISM2_JSON));
    const { init } = await import('../src/index.ts');
    const canvas = makeCanvas();
    const l2d = init(canvas);
    await l2d.load({ path: '/models/test.model.json' });

    l2d.playMotion('Idle', 1);
    // eslint-disable-next-line no-undefined
    expect(mockCubism2Instance.playMotion).toHaveBeenCalledWith('Idle', 1, undefined);
  });

  it('playMotion() 动作组不存在时不调用底层', async () => {
    vi.stubGlobal('fetch', makeFetchMock(CUBISM5_JSON));
    const { init } = await import('../src/index.ts');
    const canvas = makeCanvas();
    const l2d = init(canvas);
    await l2d.load({ path: '/models/test.model3.json' });

    vi.clearAllMocks();
    l2d.playMotion('NonExistent', 0);
    expect(mockCubism5Instance.playMotion).not.toHaveBeenCalled();
  });

  it('playMotion() 索引越界时不调用底层', async () => {
    vi.stubGlobal('fetch', makeFetchMock(CUBISM5_JSON));
    const { init } = await import('../src/index.ts');
    const canvas = makeCanvas();
    const l2d = init(canvas);
    await l2d.load({ path: '/models/test.model3.json' });

    vi.clearAllMocks();
    l2d.playMotion('Idle', 99);
    expect(mockCubism5Instance.playMotion).not.toHaveBeenCalled();
  });

  it('playMotionByFile() 文件不存在时不调用底层', async () => {
    vi.stubGlobal('fetch', makeFetchMock(CUBISM5_JSON));
    const { init } = await import('../src/index.ts');
    const canvas = makeCanvas();
    const l2d = init(canvas);
    await l2d.load({ path: '/models/test.model3.json' });

    vi.clearAllMocks();
    l2d.playMotionByFile('motions/nonexistent.motion3.json');
    expect(mockCubism5Instance.playMotion).not.toHaveBeenCalled();
  });
});

describe('l2D.showHitAreas() — 加载后', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it('showHitAreas(true) 加载后调用 overlay.show()', async () => {
    vi.stubGlobal('fetch', makeFetchMock(CUBISM5_JSON));
    const { init } = await import('../src/index.ts');
    const canvas = makeCanvas();
    const l2d = init(canvas);
    await l2d.load({ path: '/models/test.model3.json' });

    vi.clearAllMocks();
    l2d.showHitAreas(true);
    expect(mockHitAreaOverlayInstance.show).toHaveBeenCalledOnce();
  });

  it('showHitAreas(false) 调用 overlay.hide()', async () => {
    vi.stubGlobal('fetch', makeFetchMock(CUBISM5_JSON));
    const { init } = await import('../src/index.ts');
    const canvas = makeCanvas();
    const l2d = init(canvas);
    await l2d.load({ path: '/models/test.model3.json' });

    vi.clearAllMocks();
    l2d.showHitAreas(false);
    expect(mockHitAreaOverlayInstance.hide).toHaveBeenCalledOnce();
  });
});

describe('l2D.destroy() — Cubism2', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it('destroy() 调用 Cubism2 底层的 destroy()', async () => {
    vi.stubGlobal('fetch', makeFetchMock(CUBISM2_JSON));
    const { init } = await import('../src/index.ts');
    const canvas = makeCanvas();
    const l2d = init(canvas);
    await l2d.load({ path: '/models/test.model.json' });

    l2d.destroy();
    expect(mockCubism2Instance.destroy).toHaveBeenCalledOnce();
  });
});

describe('l2D.load() — 二次加载清理旧模型', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it('cubism2 → Cubism2 二次 load 时调用旧模型的 destroy()', async () => {
    vi.stubGlobal('fetch', makeFetchMock(CUBISM2_JSON));
    const { init } = await import('../src/index.ts');
    const canvas = makeCanvas();
    const l2d = init(canvas);

    await l2d.load({ path: '/models/first.model.json' });
    vi.clearAllMocks();

    await l2d.load({ path: '/models/second.model.json' });
    expect(mockCubism2Instance.destroy).toHaveBeenCalledOnce();
  });

  it('cubism5 → Cubism5 二次 load 时调用旧模型的 release()', async () => {
    vi.stubGlobal('fetch', makeFetchMock(CUBISM5_JSON));
    const { init } = await import('../src/index.ts');
    const canvas = makeCanvas();
    const l2d = init(canvas);

    await l2d.load({ path: '/models/first.model3.json' });
    vi.clearAllMocks();

    await l2d.load({ path: '/models/second.model3.json' });
    expect(mockCubism5Instance.release).toHaveBeenCalledOnce();
  });
});

describe('l2D.setPosition()', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it('cubism6 加载后 setPosition() 调用底层', async () => {
    vi.stubGlobal('fetch', makeFetchMock(CUBISM5_JSON));
    const { init } = await import('../src/index.ts');
    const canvas = makeCanvas();
    const l2d = init(canvas);
    await l2d.load({ path: '/models/test.model3.json' });

    l2d.setPosition(0.5, -0.2);
    expect(mockCubism5Instance.setPosition).toHaveBeenCalledWith(0.5, -0.2);
  });

  it('cubism2 加载后 setPosition() 调用底层', async () => {
    vi.stubGlobal('fetch', makeFetchMock(CUBISM2_JSON));
    const { init } = await import('../src/index.ts');
    const canvas = makeCanvas();
    const l2d = init(canvas);
    await l2d.load({ path: '/models/test.model.json' });

    l2d.setPosition(-1, 0.3);
    expect(mockCubism2Instance.setPosition).toHaveBeenCalledWith(-1, 0.3);
  });

  it('未加载时 setPosition() 不抛出错误', async () => {
    const { init } = await import('../src/index.ts');
    const l2d = init(makeCanvas());
    expect(() => l2d.setPosition(0, 0)).not.toThrow();
  });
});

describe('l2D.setParams()', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it('cubism6 加载后 setParams() 调用底层', async () => {
    vi.stubGlobal('fetch', makeFetchMock(CUBISM5_JSON));
    const { init } = await import('../src/index.ts');
    const canvas = makeCanvas();
    const l2d = init(canvas);
    await l2d.load({ path: '/models/test.model3.json' });

    vi.clearAllMocks();
    l2d.setParams({ ParamEyeLOpen: 0, ParamA: 1 });
    expect(mockCubism5Instance.setParams).toHaveBeenCalledWith({ ParamEyeLOpen: 0, ParamA: 1 });
  });

  it('cubism2 加载后 setParams() 调用底层', async () => {
    vi.stubGlobal('fetch', makeFetchMock(CUBISM2_JSON));
    const { init } = await import('../src/index.ts');
    const canvas = makeCanvas();
    const l2d = init(canvas);
    await l2d.load({ path: '/models/test.model.json' });

    vi.clearAllMocks();
    l2d.setParams({ ParamAngleX: 15 });
    expect(mockCubism2Instance.setParams).toHaveBeenCalledWith({ ParamAngleX: 15 });
  });

  it('未加载时 setParams() 不抛出错误', async () => {
    const { init } = await import('../src/index.ts');
    const l2d = init(makeCanvas());
    expect(() => l2d.setParams({ ParamEyeLOpen: 0 })).not.toThrow();
  });
});

describe('l2D.setScale()', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it('cubism6 加载后 setScale() 调用底层', async () => {
    vi.stubGlobal('fetch', makeFetchMock(CUBISM5_JSON));
    const { init } = await import('../src/index.ts');
    const canvas = makeCanvas();
    const l2d = init(canvas);
    await l2d.load({ path: '/models/test.model3.json' });

    vi.clearAllMocks();
    l2d.setScale(1.5);
    expect(mockCubism5Instance.setScale).toHaveBeenCalledWith(1.5);
  });

  it('cubism2 加载后 setScale() 调用底层', async () => {
    vi.stubGlobal('fetch', makeFetchMock(CUBISM2_JSON));
    const { init } = await import('../src/index.ts');
    const canvas = makeCanvas();
    const l2d = init(canvas);
    await l2d.load({ path: '/models/test.model.json' });

    vi.clearAllMocks();
    l2d.setScale(0.5);
    expect(mockCubism2Instance.setScale).toHaveBeenCalledWith(0.5);
  });

  it('未加载时 setScale() 不抛出错误', async () => {
    const { init } = await import('../src/index.ts');
    const l2d = init(makeCanvas());
    expect(() => l2d.setScale(1)).not.toThrow();
  });
});

describe('l2D.create() deprecated', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it('create() 等价于 load()，触发 loaded 事件', async () => {
    vi.stubGlobal('fetch', makeFetchMock(CUBISM5_JSON));
    const { init } = await import('../src/index.ts');
    const canvas = makeCanvas();
    const l2d = init(canvas);

    const onLoaded = vi.fn();
    l2d.on('loaded', onLoaded);
    await l2d.create({ path: '/models/test.model3.json' });

    expect(onLoaded).toHaveBeenCalledOnce();
  });
});
