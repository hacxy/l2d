import type { L2D } from '../../demo-types';
import { motionRowKey, motionStem } from './demo-helpers';
import { createCompactListPanel, DEMO_BTN_MOTION_ROW } from './demo-list-panel';

/** 用户点列表时用高优先级打断当前动作 */
const CLICK_PRIO = 3;

interface Row {
  button: HTMLButtonElement
  bar: HTMLDivElement
}

export interface AttachMotionListOptions {
  /** 是否在面板内顶部显示音量滑块，默认 false */
  volume?: boolean
}

/**
 * 在 Live2D canvas 上挂载动作列表面板，含播放进度条。
 * 不负责调用 `l2d.load()`，由调用方自行加载模型。
 * @returns cleanup 函数，切换 demo 时调用
 */
export function attachMotionList(l2d: L2D, opts: AttachMotionListOptions = {}): () => void {
  const { panel, list, mount } = createCompactListPanel('动作');
  mount(l2d);

  // 音量滑块行（可选）
  if (opts.volume) {
    const volumeRow = document.createElement('div');
    volumeRow.style.cssText = 'display:flex;align-items:center;gap:5px;margin-bottom:6px;';

    const volLabel = document.createElement('span');
    volLabel.style.cssText = 'font-size:9px;color:#aaa;font-family:system-ui,sans-serif;white-space:nowrap;flex-shrink:0;';
    volLabel.textContent = '音量';

    const input = document.createElement('input');
    input.type = 'range';
    input.min = '0';
    input.max = '1';
    input.step = '0.01';
    input.value = '0';
    input.style.cssText = 'flex:1;height:3px;accent-color:#4acc7a;cursor:pointer;margin:0;';

    const valLabel = document.createElement('span');
    valLabel.style.cssText = 'font-size:9px;color:#ccc;font-family:ui-monospace,monospace;white-space:nowrap;flex-shrink:0;min-width:2.8em;text-align:right;';
    valLabel.textContent = '0.00';

    input.oninput = () => {
      const v = Number(input.value);
      valLabel.textContent = v.toFixed(2);
      l2d.setVolume(v);
    };

    volumeRow.append(volLabel, input, valLabel);
    panel.insertBefore(volumeRow, list);
  }

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

  return () => {
    stopRaf();
    for (const { button } of rows.values())
      button.onclick = null;
    panel.remove();
  };
}
