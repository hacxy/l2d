import type { L2D } from '../../demo-types';

export interface CanvasVolumeSliderOptions {
  /** 初始音量，默认 0（静音） */
  initial?: number
}

/**
 * 在 Live2D canvas 上方叠一层 2D canvas，绘制可拖拽的水平滑块并驱动 {@link L2D.setVolume}。
 */
export function attachCanvasVolumeSlider(l2d: L2D, opts: CanvasVolumeSliderOptions = {}): () => void {
  let volume = opts.initial ?? 0;

  const canvas = l2d.getCanvas();
  const overlay = document.createElement('canvas');
  overlay.style.cssText = 'position:fixed;z-index:9998;touch-action:none;cursor:grab;';
  document.body.appendChild(overlay);
  const ctx = overlay.getContext('2d')!;

  let dragging = false;
  let rafId: number | null = null;
  let modelReady = false;

  const applyVolume = () => {
    if (modelReady)
      l2d.setVolume(volume);
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
    volume = t;
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
    const thumbX = trackX + volume * trackW;
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
    const thumbX = L.trackX + volume * L.trackW;

    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = 'rgba(28,28,32,0.82)';
    ctx.fillRect(L.trackX, L.trackY, L.trackW, L.trackH);

    ctx.fillStyle = 'rgba(88,200,130,0.95)';
    ctx.fillRect(L.trackX, L.trackY, Math.max(L.trackH * 0.5, volume * L.trackW), L.trackH);

    ctx.fillStyle = '#eef1ff';
    ctx.strokeStyle = '#4acc7a';
    ctx.lineWidth = L.dpr;
    ctx.beginPath();
    ctx.arc(thumbX, L.thumbCy, L.thumbR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.font = `${Math.round(11 * L.dpr)}px system-ui,sans-serif`;
    ctx.textBaseline = 'bottom';
    ctx.fillText(`volume: ${volume.toFixed(2)}`, L.trackX, L.trackY - 5 * L.dpr);

    rafId = requestAnimationFrame(paintLoop);
  };

  const onPointerDown = (e: PointerEvent) => {
    if (!hitSlider(e.clientX, e.clientY))
      return;
    dragging = true;
    overlay.setPointerCapture(e.pointerId);
    overlay.style.cursor = 'grabbing';
    valueFromClientX(e.clientX);
    applyVolume();
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!dragging)
      return;
    valueFromClientX(e.clientX);
    applyVolume();
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
    l2d.setVolume(volume);
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
