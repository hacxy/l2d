import type { Demo, L2D } from '../demo-types';
import { motionRowKey, motionStem } from './utils/demo-helpers';
import { createCompactListPanel, DEMO_BTN_MOTION_ROW } from './utils/demo-list-panel';

/** 用户点列表时用高优先级打断当前 Idle */
const CLICK_PRIO = 3;

interface Row {
  button: HTMLButtonElement
  bar: HTMLDivElement
}

function setupInstance(l2d: L2D, modelPath: string) {
  const { panel, list, mount } = createCompactListPanel('动作');
  mount(l2d);

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
        const key = motionRowKey(group, index);
        const button = document.createElement('button');
        button.type = 'button';
        button.style.cssText = DEMO_BTN_MOTION_ROW;

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
    const key = motionRowKey(group, index);
    activeKey = key;
    paintRows(key);
    runProgress(key, typeof duration === 'number' && duration > 0 ? duration : null);
  });

  l2d.on('motionend', (group, index) => {
    const key = motionRowKey(group, index);
    stopRaf();
    if (activeKey === key) {
      activeKey = null;
      paintRows(null);
    }
  });

  l2d.on('loaded', buildList);

  l2d.load({ path: modelPath });

  return () => {
    stopRaf();
    for (const { button } of rows.values())
      button.onclick = null;
    panel.remove();
  };
}

export default {
  title: '动作列表与播放进度 (Cubism6)',
  canvasCount: 2,
  setup([l2d1, l2d2]) {
    const cleanup1 = setupInstance(l2d1, 'https://model.hacxy.cn/Haru/Haru.model3.json');
    const cleanup2 = setupInstance(l2d2, 'https://model.hacxy.cn/Mao/Mao.model3.json');

    return () => {
      cleanup1();
      cleanup2();
    };
  },
} satisfies Demo;
