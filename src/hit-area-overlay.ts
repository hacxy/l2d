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
    overlay.style.cssText = 'position:absolute;pointer-events:none;';
    overlay.width = this.canvas.width;
    overlay.height = this.canvas.height;
    overlay.style.width = this.canvas.style.width;
    overlay.style.height = this.canvas.style.height;
    overlay.style.top = `${this.canvas.offsetTop}px`;
    overlay.style.left = `${this.canvas.offsetLeft}px`;
    if (this.canvas.style.transform) {
      overlay.style.transform = this.canvas.style.transform;
    }
    this.canvas.insertAdjacentElement('afterend', overlay);
    this.overlay = overlay;

    const ctx = overlay.getContext('2d')!;
    const draw = () => {
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

  syncTransform(transform: string) {
    if (this.overlay) {
      this.overlay.style.transform = transform;
    }
  }
}
