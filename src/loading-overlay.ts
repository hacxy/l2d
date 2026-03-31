import type { LoadingOverlayOptions } from './types.js';

export class LoadingOverlay {
  private overlay: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private rafId: number | null = null;
  private loaded = 0;
  private total = 0;
  private recentFiles: string[] = [];
  private opts: Required<LoadingOverlayOptions> = {
    background: 'rgba(0,0,0,0.55)',
    trackColor: 'rgba(255,255,255,0.15)',
    barColor: 'rgba(255,255,255,0.85)',
    textColor: 'rgba(255,255,255,0.9)',
  };

  constructor(private canvas: HTMLCanvasElement) {}

  show(total: number, options?: LoadingOverlayOptions) {
    if (options)
      this.opts = { ...this.opts, ...options };
    this.loaded = 0;
    this.total = total;
    this.recentFiles = [];

    if (this.overlay)
      this.hide();

    const overlay = document.createElement('canvas');
    overlay.width = this.canvas.width;
    overlay.height = this.canvas.height;
    overlay.style.cssText = 'position:absolute;pointer-events:none;';
    overlay.style.width = this.canvas.style.width || `${this.canvas.width}px`;
    overlay.style.height = this.canvas.style.height || `${this.canvas.height}px`;
    overlay.style.top = `${this.canvas.offsetTop}px`;
    overlay.style.left = `${this.canvas.offsetLeft}px`;
    if (this.canvas.style.transform)
      overlay.style.transform = this.canvas.style.transform;
    this.canvas.insertAdjacentElement('afterend', overlay);
    this.overlay = overlay;
    this.ctx = overlay.getContext('2d')!;
    this.draw();
  }

  progress(loaded: number, total: number, file: string) {
    this.loaded = loaded;
    this.total = total;
    const name = file.split('/').pop() ?? file;
    this.recentFiles.unshift(name);
    if (this.recentFiles.length > 4)
      this.recentFiles.pop();
  }

  hide() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.overlay?.remove();
    this.overlay = null;
    this.ctx = null;
  }

  private draw() {
    const ctx = this.ctx;
    const overlay = this.overlay;
    if (!ctx || !overlay)
      return;

    const w = overlay.width;
    const h = overlay.height;
    const pct = this.total > 0 ? this.loaded / this.total : 0;

    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = this.opts.background;
    ctx.fillRect(0, 0, w, h);

    const barW = w * 0.7;
    const barH = Math.max(6, h * 0.025);
    const barX = (w - barW) / 2;
    const barY = h * 0.52;
    const radius = barH / 2;

    // Bar track
    ctx.fillStyle = this.opts.trackColor;
    this.roundRect(ctx, barX, barY, barW, barH, radius);
    ctx.fill();

    // Bar fill
    if (pct > 0) {
      ctx.fillStyle = this.opts.barColor;
      this.roundRect(ctx, barX, barY, barW * pct, barH, radius);
      ctx.fill();
    }

    // Percentage
    ctx.fillStyle = this.opts.textColor;
    ctx.font = `bold ${Math.max(11, h * 0.045)}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.round(pct * 100)}%`, w / 2, barY - barH * 0.8);

    // Count
    ctx.font = `${Math.max(9, h * 0.032)}px monospace`;
    ctx.fillStyle = this.opts.textColor;
    ctx.fillText(`${this.loaded} / ${this.total} files`, w / 2, barY + barH + Math.max(12, h * 0.038));

    // Recent files
    const fileY0 = barY + barH + Math.max(28, h * 0.09);
    ctx.font = `${Math.max(8, h * 0.026)}px monospace`;
    ctx.fillStyle = this.opts.textColor;
    this.recentFiles.forEach((name, i) => {
      ctx.globalAlpha = Math.max(0, 0.9 - i * 0.2);
      ctx.fillText(name, w / 2, fileY0 + i * Math.max(13, h * 0.038));
    });
    ctx.globalAlpha = 1;

    this.rafId = requestAnimationFrame(() => this.draw());
  }

  private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
}
