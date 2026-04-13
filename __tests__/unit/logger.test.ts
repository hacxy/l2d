import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import logger from '../../src/logger';

// logger 是模块级单例，每个测试前后需要还原 level
beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  (logger as any).level = 'info'; // 恢复默认 level
  vi.restoreAllMocks();
});

describe('logger — 默认 level: info', () => {
  it('error() 输出 [L2D][ERROR]', () => {
    logger.error('something broke');
    expect(console.error).toHaveBeenCalledWith('[L2D][ERROR]', 'something broke');
  });

  it('warn() 输出 [L2D][WARN]', () => {
    logger.warn('heads up');
    expect(console.warn).toHaveBeenCalledWith('[L2D][WARN]', 'heads up');
  });

  it('info() 输出 [L2D][INFO]', () => {
    logger.info('hello');
    expect(console.log).toHaveBeenCalledWith('[L2D][INFO]', 'hello');
  });

  it('trace() 默认 level=info 时不输出', () => {
    logger.trace('verbose');
    expect(console.log).not.toHaveBeenCalled();
  });

  it('额外参数透传给 console', () => {
    const extra = { key: 'value' };
    logger.error('msg', extra);
    expect(console.error).toHaveBeenCalledWith('[L2D][ERROR]', 'msg', extra);
  });
});

describe('logger.setLevel()', () => {
  it('setLevel(undefined) 不改变当前 level', () => {
    // eslint-disable-next-line no-undefined
    logger.setLevel(undefined);
    logger.trace('should not appear');
    expect(console.log).not.toHaveBeenCalled();
  });

  it('setLevel("trace") 后 trace() 正常输出', () => {
    logger.setLevel('trace');
    logger.trace('detailed');
    expect(console.log).toHaveBeenCalledWith('[L2D][TRACE]', 'detailed');
  });

  it('setLevel("error") 后 warn/info/trace 不输出', () => {
    logger.setLevel('error');
    logger.warn('ignored');
    logger.info('ignored');
    logger.trace('ignored');
    expect(console.warn).not.toHaveBeenCalled();
    expect(console.log).not.toHaveBeenCalled();
  });

  it('setLevel("error") 后 error() 仍然输出', () => {
    logger.setLevel('error');
    logger.error('critical');
    expect(console.error).toHaveBeenCalledWith('[L2D][ERROR]', 'critical');
  });

  it('setLevel("warn") 后 info/trace 不输出', () => {
    logger.setLevel('warn');
    logger.info('ignored');
    logger.trace('ignored');
    expect(console.log).not.toHaveBeenCalled();
  });
});
