import type { ModelState } from './motion-controller.js';
import { HitAreaOverlay } from './hit-area-overlay.js';

export function createHitAreaOverlay(canvas: HTMLCanvasElement, state: ModelState): HitAreaOverlay {
  return new HitAreaOverlay(canvas, () => {
    return state.currentVersion === 2
      ? (state.l2d2Model?.getHitAreaBounds() ?? [])
      : (state.l2d6Model?.getHitAreaBounds() ?? []);
  });
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
