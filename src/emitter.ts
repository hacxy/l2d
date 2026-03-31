export class Emitter<EventMap extends Record<keyof EventMap, (...args: any[]) => void>> {
  private _listeners: { [K in keyof EventMap]?: EventMap[K][] } = {};

  on<K extends keyof EventMap>(event: K, listener: EventMap[K]) {
    if (!this._listeners[event]) {
      this._listeners[event] = [];
    }
    (this._listeners[event] as EventMap[K][]).push(listener);
    return this;
  }

  protected emit<K extends keyof EventMap>(event: K, ...args: Parameters<EventMap[K]>) {
    this._listeners[event]?.forEach(fn => (fn as (...a: typeof args) => void)(...args));
  }
}
