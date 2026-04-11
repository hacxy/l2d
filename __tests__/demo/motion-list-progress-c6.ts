import type { Demo } from '../demo-types';

function rowKey(group: string, index: number) {
  return `${group}\0${index}`;
}

function motionStem(file: string) {
  return file
    .replace(/^.*\//, '')
    .replace(/\.motion3\.json$/i, '')
    .replace(/\.motion\.json$/i, '')
    .replace(/\.mtn$/i, '')
    .replace(/\.json$/i, '');
}

/** 用户点列表时用高优先级打断当前 Idle */
const CLICK_PRIO = 3;

interface Row {
  button: HTMLButtonElement
  bar: HTMLDivElement
}

export default {
  title: '动作列表与播放进度 (Cubism6)',
  setup([l2d]) {
    const wrap = l2d.getCanvas().parentElement as HTMLElement | null;

    const panel = document.createElement('div');
    panel.style.cssText
      = 'position:absolute;bottom:6px;left:6px;right:6px;z-index:2;max-height:min(132px,38%);overflow:auto;padding:5px 6px;border:1px solid #444;border-radius:5px;background:rgba(12,12,12,0.88);box-sizing:border-box';

    const title = document.createElement('div');
    title.textContent = '动作';
    title.style.cssText = 'font-size:9px;color:#777;margin-bottom:5px;font-family:system-ui,sans-serif';

    const list = document.createElement('div');
    list.style.cssText = 'display:flex;flex-direction:column;gap:4px';
    panel.append(title, list);

    const rows = new Map<string, Row>();
    let rafId: number | null = null;
    let activeKey: string | null = null;

    const stopRaf = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    function paintRows(highlightKey: string | null) {
      for (const { button, bar } of rows.values()) {
        button.style.borderColor = '#555';
        button.style.background = 'rgba(0,0,0,0.2)';
        bar.style.width = '0%';
      }
      if (!highlightKey)
        return;
      const row = rows.get(highlightKey);
      if (row) {
        row.button.style.borderColor = '#5a7acc';
        row.button.style.background = 'rgba(40,60,120,0.25)';
      }
    }

    function buildList() {
      list.replaceChildren();
      rows.clear();
      stopRaf();
      activeKey = null;

      for (const [group, files] of Object.entries(l2d.getMotions())) {
        files.forEach((file, index) => {
          const key = rowKey(group, index);
          const button = document.createElement('button');
          button.type = 'button';
          button.style.cssText
            = 'display:flex;flex-direction:column;align-items:stretch;gap:3px;width:100%;padding:4px 5px;border:1px solid #555;border-radius:3px;cursor:pointer;text-align:left;font-family:ui-monospace,monospace;font-size:8px;color:#ccc;background:rgba(0,0,0,0.2)';

          const label = document.createElement('div');
          label.textContent = motionStem(file) || `#${index}`;
          button.title = `${group} #${index} — ${file}`;
          label.style.cssText = 'line-height:1.25;overflow:hidden;text-overflow:ellipsis;white-space:nowrap';

          const track = document.createElement('div');
          track.style.cssText = 'height:3px;background:#222;border-radius:1px;overflow:hidden';
          const bar = document.createElement('div');
          bar.style.cssText = 'height:100%;width:0%;background:#6b9fff;border-radius:2px';
          track.append(bar);
          button.append(label, track);
          button.onclick = () => l2d.playMotion(group, index, CLICK_PRIO);

          list.append(button);
          rows.set(key, { button, bar });
        });
      }
    }

    function runProgress(key: string, durationSec: number | null) {
      stopRaf();
      if (!rows.has(key))
        return;

      const t0 = performance.now();
      const totalMs = typeof durationSec === 'number' && durationSec > 0 ? durationSec * 1000 : 0;
      let wave = 0;

      const tick = () => {
        const row = rows.get(key);
        if (!row)
          return;
        if (totalMs > 0) {
          const p = Math.min(1, (performance.now() - t0) / totalMs);
          row.bar.style.width = `${p * 100}%`;
          if (p >= 1) {
            rafId = null;
            return;
          }
        }
        else {
          wave += 0.07;
          row.bar.style.width = `${42 + Math.sin(wave) * 38}%`;
        }
        rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
    }

    l2d.on('motionstart', (group, index, duration) => {
      const key = rowKey(group, index);
      activeKey = key;
      paintRows(key);
      runProgress(key, typeof duration === 'number' && duration > 0 ? duration : null);
    });

    l2d.on('motionend', (group, index) => {
      const key = rowKey(group, index);
      stopRaf();
      if (activeKey === key) {
        activeKey = null;
        paintRows(null);
      }
    });

    l2d.on('loaded', buildList);

    wrap?.append(panel);
    l2d.load({ path: 'https://model.hacxy.cn/Mao/Mao.model3.json' });

    return () => {
      stopRaf();
      for (const { button } of rows.values())
        button.onclick = null;
      panel.remove();
    };
  },
} satisfies Demo;
