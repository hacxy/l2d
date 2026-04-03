import { describe, expect, it, vi } from 'vitest';
import { Emitter } from '../src/emitter';

interface TestEventMap {
  greet: (name: string) => void
  count: (n: number) => void
  noargs: () => void
}

class TestEmitter extends Emitter<TestEventMap> {
  fire<K extends keyof TestEventMap>(event: K, ...args: Parameters<TestEventMap[K]>) {
    this.emit(event, ...args);
  }
}

describe('emitter', () => {
  it('on() 注册监听器后 emit() 触发回调', () => {
    const emitter = new TestEmitter();
    const fn = vi.fn();
    emitter.on('greet', fn);
    emitter.fire('greet', 'Alice');
    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith('Alice');
  });

  it('同一事件可注册多个监听器，全部触发', () => {
    const emitter = new TestEmitter();
    const fn1 = vi.fn();
    const fn2 = vi.fn();
    emitter.on('greet', fn1);
    emitter.on('greet', fn2);
    emitter.fire('greet', 'Bob');
    expect(fn1).toHaveBeenCalledWith('Bob');
    expect(fn2).toHaveBeenCalledWith('Bob');
  });

  it('不同事件互不干扰', () => {
    const emitter = new TestEmitter();
    const greetFn = vi.fn();
    const countFn = vi.fn();
    emitter.on('greet', greetFn);
    emitter.on('count', countFn);
    emitter.fire('count', 42);
    expect(greetFn).not.toHaveBeenCalled();
    expect(countFn).toHaveBeenCalledWith(42);
  });

  it('没有监听器时 emit() 不抛出错误', () => {
    const emitter = new TestEmitter();
    expect(() => emitter.fire('greet', 'no-listener')).not.toThrow();
  });

  it('on() 返回 this，支持链式调用', () => {
    const emitter = new TestEmitter();
    const fn = vi.fn();
    const result = emitter.on('noargs', fn);
    expect(result).toBe(emitter);
  });

  it('emit() 按注册顺序依次调用', () => {
    const emitter = new TestEmitter();
    const order: number[] = [];
    emitter.on('noargs', () => order.push(1));
    emitter.on('noargs', () => order.push(2));
    emitter.on('noargs', () => order.push(3));
    emitter.fire('noargs');
    expect(order).toEqual([1, 2, 3]);
  });
});
