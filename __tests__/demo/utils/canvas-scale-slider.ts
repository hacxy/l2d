import type { L2D } from '../../demo-types';

export interface CanvasScaleSliderOptions {
  /** 最小缩放，默认 0.2 */
  min?: number
  /** 最大缩放，默认 2.2 */
  max?: number
  /** 初始值，应与 {@link L2D.load} 的 `scale` 一致 */
  initial?: number
}

/**
 * 在 Live2D canvas 上方叠一层 2D canvas，绘制可拖拽的水平滑块并驱动 {@link L2D.setScale}。
 */
export function attachCanvasScaleSlider(l2d: L2D, opts: CanvasScaleSliderOptions = {}): () => void {
  const MIN = opts.min ?? 0.2;
  const MAX = opts.max ?? 2.2;
  let scale = opts.initial ?? 1;

  const canvas = l2d.getCanvas();
  const overlay = document.createElement('canvas');
  overlay.style.cssText = 'position:fixed;z-index:9998;touch-action:none;cursor:grab;';
  document.body.appendChild(overlay);
  const ctx = overlay.getContext('2d')!;

  let dragging = false;
  let rafId: number | null = null;
  let modelReady = false;

  const applyScale = () => {
    if (modelReady)
      l2d.setScale(scale);
  };

  const layout = (w: number, h: number) => {
    const dpr = w / (canvas.getBoundingClientRect().width || 1);
    const trackPad = 14 * dpr;
    const trackH = 7 * dpr;
    const marginBottom = 14 * dpr;
    const trackY = h - marginBottom - trackH;
    const trackX = trackPad;
    const trackW = Math.max(0, w - 2 * trackPad);
    return { dpr, trackX, trackY, trackW, trackH, thumbR: 9 * dpr, thumbCy: trackY + trackH / 2 };
  };

  const valueFromClientX = (clientX: number) => {
    const r = overlay.getBoundingClientRect();
    if (r.width <= 0)
      return;
    const { trackX, trackW } = layout(overlay.width, overlay.height);
    if (trackW <= 0)
      return;
    const x = ((clientX - r.left) / r.width) * overlay.width;
    const t = Math.min(1, Math.max(0, (x - trackX) / trackW));
    scale = MIN + t * (MAX - MIN);
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

  const hitSlider = (clientX: number, clientY: number) => {
    const { x, y } = bitmapFromClient(clientX, clientY);
    const { trackX, trackY, trackW, trackH, thumbR, thumbCy, dpr } = layout(overlay.width, overlay.height);
    const t = (scale - MIN) / (MAX - MIN);
    const thumbX = trackX + t * trackW;
    const pad = thumbR + 5 * dpr;
    const onTrack = x >= trackX - pad && x <= trackX + trackW + pad
      && y >= trackY - pad && y <= trackY + trackH + pad;
    const onThumb = (x - thumbX) ** 2 + (y - thumbCy) ** 2 <= (thumbR + 6 * dpr) ** 2;
    return onTrack || onThumb;
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

    const L = layout(w, h);
    const t = (scale - MIN) / (MAX - MIN);
    const thumbX = L.trackX + t * L.trackW;

    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = 'rgba(28,28,32,0.82)';
    ctx.fillRect(L.trackX, L.trackY, L.trackW, L.trackH);

    ctx.fillStyle = 'rgba(88,132,230,0.95)';
    ctx.fillRect(L.trackX, L.trackY, Math.max(L.trackH * 0.5, t * L.trackW), L.trackH);

    ctx.fillStyle = '#eef1ff';
    ctx.strokeStyle = '#5a7acc';
    ctx.lineWidth = L.dpr;
    ctx.beginPath();
    ctx.arc(thumbX, L.thumbCy, L.thumbR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.font = `${Math.round(11 * L.dpr)}px system-ui,sans-serif`;
    ctx.textBaseline = 'bottom';
    ctx.fillText(`scale: ${scale.toFixed(2)}`, L.trackX, L.trackY - 5 * L.dpr);

    rafId = requestAnimationFrame(paintLoop);
  };

  const onPointerDown = (e: PointerEvent) => {
    if (!hitSlider(e.clientX, e.clientY))
      return;
    dragging = true;
    overlay.setPointerCapture(e.pointerId);
    overlay.style.cursor = 'grabbing';
    valueFromClientX(e.clientX);
    applyScale();
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!dragging)
      return;
    valueFromClientX(e.clientX);
    applyScale();
  };

  const onPointerUp = (e: PointerEvent) => {
    if (!dragging)
      return;
    dragging = false;
    overlay.style.cursor = 'grab';
    if (overlay.hasPointerCapture(e.pointerId))
      overlay.releasePointerCapture(e.pointerId);
  };

  const onLoaded = () => {
    modelReady = true;
    l2d.setScale(scale);
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
