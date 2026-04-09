type BoundsProvider = () => Array<{ name: string, x: number, y: number, w: number, h: number }>;

export class HitAreaOverlay {
  private canvas: HTMLCanvasElement;
  private getBounds: BoundsProvider;
  private overlay: HTMLCanvasElement | null = null;
  private rafId: number | null = null;

  constructor(canvas: HTMLCanvasElement, getBounds: BoundsProvider) {
    this.canvas = canvas;
    this.getBounds = getBounds;
  }

  show() {
    const overlay = document.createElement('canvas');
    overlay.style.cssText = 'position:fixed;pointer-events:none;top:0;left:0;';
    document.body.appendChild(overlay);
    this.overlay = overlay;

    const ctx = overlay.getContext('2d')!;
    const draw = () => {
      const rect = this.canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const w = rect.width * dpr;
      const h = rect.height * dpr;

      if (overlay.width !== w || overlay.height !== h) {
        overlay.width = w;
        overlay.height = h;
      }
      overlay.style.left = `${rect.left}px`;
      overlay.style.top = `${rect.top}px`;
      overlay.style.width = `${rect.width}px`;
      overlay.style.height = `${rect.height}px`;
      overlay.style.zIndex = '9999';

      ctx.clearRect(0, 0, overlay.width, overlay.height);
      for (const b of this.getBounds()) {
        ctx.strokeStyle = 'rgba(0,255,0,0.9)';
        ctx.lineWidth = 2;
        ctx.strokeRect(b.x, b.y, b.w, b.h);
        ctx.fillStyle = 'rgba(0,255,0,0.15)';
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.fillStyle = 'rgba(0,255,0,1)';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(b.name, b.x + 4, b.y + 14);
      }
      this.rafId = requestAnimationFrame(draw);
    };
    draw();
  }

  hide() {
    this.overlay?.remove();
    this.overlay = null;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  syncTransform(_transform: string) {}
}
