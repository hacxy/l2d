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
