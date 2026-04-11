import type { L2D } from '../../demo-types';

export interface CanvasPositionSlidersOptions {
  minX?: number
  maxX?: number
  minY?: number
  maxY?: number
  initialX?: number
  initialY?: number
}

type Axis = 'x' | 'y';

/**
 * 在 Live2D canvas 上叠一层 2D canvas，底部两条可拖拽水平滑块分别控制 {@link L2D.setPosition} 的 x、y。
 * 数值为视图逻辑空间中的小偏移（约 ±1～±2 量级，非像素）；Cubism2 内部会再按画布高宽比缩放。
 */
export function attachCanvasPositionSliders(l2d: L2D, opts: CanvasPositionSlidersOptions = {}): () => void {
  const MIN_X = opts.minX ?? -2;
  const MAX_X = opts.maxX ?? 2;
  const MIN_Y = opts.minY ?? -2;
  const MAX_Y = opts.maxY ?? 2;
  let px = opts.initialX ?? 0;
  let py = opts.initialY ?? 0;

  const canvas = l2d.getCanvas();
  const overlay = document.createElement('canvas');
  overlay.style.cssText = 'position:fixed;z-index:9998;touch-action:none;cursor:grab;';
  document.body.appendChild(overlay);
  const ctx = overlay.getContext('2d')!;

  let dragging: Axis | null = null;
  let rafId: number | null = null;
  let modelReady = false;

  const applyPosition = () => {
    if (modelReady)
      l2d.setPosition(px, py);
  };

  const rowLayout = (w: number, h: number, rowFromBottom: 0 | 1) => {
    const cssW = canvas.getBoundingClientRect().width || 1;
    const dpr = w / cssW;
    const trackPad = 14 * dpr;
    const trackH = 7 * dpr;
    const marginBottom = 12 * dpr;
    const rowStep = trackH + 16 * dpr;
    const trackY = h - marginBottom - trackH - rowFromBottom * rowStep;
    const trackX = trackPad;
    const trackW = Math.max(0, w - 2 * trackPad);
    return { dpr, trackX, trackY, trackW, trackH, thumbR: 9 * dpr, thumbCy: trackY + trackH / 2 };
  };

  const valueFromClientForRow = (clientX: number, row: ReturnType<typeof rowLayout>, min: number, max: number) => {
    const r = overlay.getBoundingClientRect();
    if (r.width <= 0 || row.trackW <= 0)
      return;
    const x = ((clientX - r.left) / r.width) * overlay.width;
    const t = Math.min(1, Math.max(0, (x - row.trackX) / row.trackW));
    return min + t * (max - min);
  };

  const bitmapFromClient = (clientX: number, clientY: number) => {
    const r = overlay.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0)
      return { x: 0, y: 0 };
    return {
      x: ((clientX - r.left) / r.width) * overlay.width,
      y: ((clientY - r.top) / r.height) * overlay.height,
    };
  };

  const hitRow = (clientX: number, clientY: number, row: ReturnType<typeof rowLayout>, min: number, max: number, cur: number) => {
    const { x, y } = bitmapFromClient(clientX, clientY);
    const { trackX, trackY, trackW, trackH, thumbR, thumbCy, dpr } = row;
    const t = (cur - min) / (max - min);
    const thumbX = trackX + t * trackW;
    const pad = thumbR + 5 * dpr;
    const onTrack = x >= trackX - pad && x <= trackX + trackW + pad
      && y >= trackY - pad && y <= trackY + trackH + pad;
    const onThumb = (x - thumbX) ** 2 + (y - thumbCy) ** 2 <= (thumbR + 6 * dpr) ** 2;
    return onTrack || onThumb;
  };

  const hitAny = (clientX: number, clientY: number) => {
    const w = overlay.width;
    const h = overlay.height;
    const rx = rowLayout(w, h, 0);
    const ry = rowLayout(w, h, 1);
    if (hitRow(clientX, clientY, rx, MIN_X, MAX_X, px))
      return 'x' as const;
    if (hitRow(clientX, clientY, ry, MIN_Y, MAX_Y, py))
      return 'y' as const;
    return null;
  };

  const paintLoop = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = Math.max(1, rect.width * dpr);
    const h = Math.max(1, rect.height * dpr);

    if (overlay.width !== w || overlay.height !== h) {
      overlay.width = w;
      overlay.height = h;
    }
    overlay.style.left = `${rect.left}px`;
    overlay.style.top = `${rect.top}px`;
    overlay.style.width = `${rect.width}px`;
    overlay.style.height = `${rect.height}px`;

    const drawSlider = (row: ReturnType<typeof rowLayout>, min: number, max: number, cur: number, label: string) => {
      const t = (cur - min) / (max - min);
      const thumbX = row.trackX + t * row.trackW;

      ctx.fillStyle = 'rgba(28,28,32,0.82)';
      ctx.fillRect(row.trackX, row.trackY, row.trackW, row.trackH);

      ctx.fillStyle = 'rgba(88,132,230,0.95)';
      ctx.fillRect(row.trackX, row.trackY, Math.max(row.trackH * 0.5, t * row.trackW), row.trackH);

      ctx.fillStyle = '#eef1ff';
      ctx.strokeStyle = '#5a7acc';
      ctx.lineWidth = row.dpr;
      ctx.beginPath();
      ctx.arc(thumbX, row.thumbCy, row.thumbR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.font = `${Math.round(11 * row.dpr)}px system-ui,sans-serif`;
      ctx.textBaseline = 'bottom';
      ctx.fillText(label, row.trackX, row.trackY - 4 * row.dpr);
    };

    ctx.clearRect(0, 0, w, h);
    const rx = rowLayout(w, h, 0);
    const ry = rowLayout(w, h, 1);
    drawSlider(rx, MIN_X, MAX_X, px, `x: ${px.toFixed(2)}`);
    drawSlider(ry, MIN_Y, MAX_Y, py, `y: ${py.toFixed(2)}`);

    rafId = requestAnimationFrame(paintLoop);
  };

  const onPointerDown = (e: PointerEvent) => {
    const axis = hitAny(e.clientX, e.clientY);
    if (!axis)
      return;
    dragging = axis;
    overlay.setPointerCapture(e.pointerId);
    overlay.style.cursor = 'grabbing';
    const w = overlay.width;
    const h = overlay.height;
    if (axis === 'x') {
      const v = valueFromClientForRow(e.clientX, rowLayout(w, h, 0), MIN_X, MAX_X);
      if (typeof v === 'number')
        px = v;
    }
    else {
      const v = valueFromClientForRow(e.clientX, rowLayout(w, h, 1), MIN_Y, MAX_Y);
      if (typeof v === 'number')
        py = v;
    }
    applyPosition();
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!dragging)
      return;
    const w = overlay.width;
    const h = overlay.height;
    if (dragging === 'x') {
      const v = valueFromClientForRow(e.clientX, rowLayout(w, h, 0), MIN_X, MAX_X);
      if (typeof v === 'number')
        px = v;
    }
    else {
      const v = valueFromClientForRow(e.clientX, rowLayout(w, h, 1), MIN_Y, MAX_Y);
      if (typeof v === 'number')
        py = v;
    }
    applyPosition();
  };

  const onPointerUp = (e: PointerEvent) => {
    if (!dragging)
      return;
    dragging = null;
    overlay.style.cursor = 'grab';
    if (overlay.hasPointerCapture(e.pointerId))
      overlay.releasePointerCapture(e.pointerId);
  };

  const onLoaded = () => {
    modelReady = true;
    l2d.setPosition(px, py);
  };

  overlay.addEventListener('pointerdown', onPointerDown);
  overlay.addEventListener('pointermove', onPointerMove);
  overlay.addEventListener('pointerup', onPointerUp);
  overlay.addEventListener('pointercancel', onPointerUp);

  l2d.on('loaded', onLoaded);

  rafId = requestAnimationFrame(paintLoop);

  return () => {
    if (rafId !== null)
      cancelAnimationFrame(rafId);
    overlay.removeEventListener('pointerdown', onPointerDown);
    overlay.removeEventListener('pointermove', onPointerMove);
    overlay.removeEventListener('pointerup', onPointerUp);
    overlay.removeEventListener('pointercancel', onPointerUp);
    overlay.remove();
  };
}
