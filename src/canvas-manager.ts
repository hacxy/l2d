/**
 * 当 canvas 没有显式 CSS 尺寸时，用 HTML width/height 属性值补上 style，
 * 防止 resize 逻辑中 `clientWidth * dpr` 与属性值互相影响导致无限放大。
 */
export function ensureCssSize(canvas: HTMLCanvasElement): void {
  if (!canvas.style.width && !canvas.style.height) {
    const cs = getComputedStyle(canvas);
    if (cs.width === `${canvas.width}px` && cs.height === `${canvas.height}px`) {
      canvas.style.width = `${canvas.width}px`;
      canvas.style.height = `${canvas.height}px`;
    }
  }
}

export function cloneCanvas(old: HTMLCanvasElement): HTMLCanvasElement {
  const next = document.createElement('canvas');
  next.id = old.id;
  next.className = old.className;
  next.style.cssText = old.style.cssText;
  next.width = old.width;
  next.height = old.height;
  old.parentNode?.replaceChild(next, old);
  return next;
}
