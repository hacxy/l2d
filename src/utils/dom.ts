export function ensureCanvasElementInDOM(canvas: null): never;
export function ensureCanvasElementInDOM(canvas: HTMLCanvasElement | null): HTMLCanvasElement;
export function ensureCanvasElementInDOM(canvas: HTMLCanvasElement | null): HTMLCanvasElement {
  if (!canvas) {
    throw new TypeError('Target element node not found.');
  }
  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new TypeError('Target element node is not a canvas element.');
  }
  // 确保 canvas 元素在 DOM 中
  if (!canvas.isConnected) {
    document.body.appendChild(canvas);
  }

  return canvas;
}
