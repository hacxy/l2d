import type { Demo } from '../demo-types';

export default {
  title: 'Hit Area 边界 (Cubism6)',
  setup([l2d]) {
    const canvas = l2d.getCanvas();

    l2d.on('tap', areaName => {
      console.log('[tap] 命中 hit area:', areaName || '(空字符串)');
    });

    const overlay = document.createElement('canvas');
    overlay.style.cssText = 'position:fixed;pointer-events:none;z-index:9999;';
    document.body.appendChild(overlay);
    const ctx = overlay.getContext('2d')!;

    let rafId: number | null = null;

    function draw() {
      const rect = canvas.getBoundingClientRect();
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

      ctx.clearRect(0, 0, w, h);

      for (const b of l2d.getHitAreaBounds()) {
        const x = b.x * w;
        const y = b.y * h;
        const bw = b.w * w;
        const bh = b.h * h;

        ctx.strokeStyle = 'rgba(0,255,100,0.9)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, bw, bh);

        ctx.fillStyle = 'rgba(0,255,100,0.12)';
        ctx.fillRect(x, y, bw, bh);

        ctx.fillStyle = 'rgba(0,255,100,1)';
        ctx.font = `bold ${12 * dpr}px monospace`;
        ctx.fillText(b.name, x + 4, y + 14 * dpr);
      }

      rafId = requestAnimationFrame(draw);
    }

    l2d.load({
      path: 'https://model.hacxy.cn/Mao/Mao.model3.json',
    }).then(() => {
      console.log('hit areas:', l2d.getHitAreaBounds());
      draw();
    });

    return () => {
      if (rafId !== null)
        cancelAnimationFrame(rafId);
      overlay.remove();
    };
  },
} satisfies Demo;
