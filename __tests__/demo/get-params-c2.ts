import type { Demo } from '../demo-types';
import { createCompactListPanel, DEMO_BTN_COMPACT } from './utils/demo-list-panel';

const ACTIVE_THRESHOLD = 0.001;

export default {
  title: '获取参数列表 (Cubism2)',
  setup([l2d]) {
    const { panel, list, mount } = createCompactListPanel('参数 — 播放动作后活跃参数将高亮');
    mount(l2d);

    // id → { row, valueEl }
    const rows = new Map<string, { row: HTMLButtonElement, valueEl: HTMLSpanElement }>();
    let rafId: number | null = null;

    function stopRaf() {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }

    function buildList() {
      list.replaceChildren();
      rows.clear();
      stopRaf();

      for (const p of l2d.getParams()) {
        const row = document.createElement('button');
        row.type = 'button';
        row.style.cssText = DEMO_BTN_COMPACT;
        row.style.display = 'flex';
        row.style.justifyContent = 'space-between';
        row.style.alignItems = 'center';
        row.style.gap = '6px';
        row.title = `min: ${p.min}  max: ${p.max}  default: ${p.default}`;

        const idEl = document.createElement('span');
        idEl.textContent = p.id;
        idEl.style.cssText = 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1';

        const valueEl = document.createElement('span');
        valueEl.textContent = p.value.toFixed(3);
        valueEl.style.cssText = 'flex-shrink:0;color:#888;font-variant-numeric:tabular-nums';

        row.append(idEl, valueEl);
        row.onclick = () => {
          // 点击某行时用 setParams 切换到 default / min / max 之间
          const current = l2d.getParams().find(q => q.id === p.id);
          if (!current)
            return;
          const next = Math.abs(current.value - p.default) > ACTIVE_THRESHOLD ? p.default : (p.min === 0 ? p.max : p.min);
          l2d.setParams({ [p.id]: next });
          console.log(`[setParams] ${p.id} = ${next}`);
        };

        list.append(row);
        rows.set(p.id, { row, valueEl });
      }

      console.log(`[getParams] 共 ${rows.size} 个参数，播放动作后观察活跃参数高亮`);

      // rAF 循环：每帧更新 value 显示 + 活跃高亮
      const tick = () => {
        for (const p of l2d.getParams()) {
          const entry = rows.get(p.id);
          if (!entry)
            continue;
          const isActive = Math.abs(p.value - p.default) > ACTIVE_THRESHOLD;
          entry.valueEl.textContent = p.value.toFixed(3);
          entry.valueEl.style.color = isActive ? '#6b9fff' : '#888';
          entry.row.style.borderColor = isActive ? '#4a6acc' : '#555';
          entry.row.style.background = isActive ? 'rgba(40,60,120,0.25)' : 'rgba(0,0,0,0.2)';
        }
        rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
    }

    l2d.on('loaded', () => {
      buildList();
      // 加载完后播放一个随机动作，方便观察活跃参数
      const motions = l2d.getMotions();
      const groups = Object.keys(motions);
      if (groups.length > 0) {
        const g = groups[0];
        l2d.playMotion(g, 0);
        console.log(`[demo] 自动播放 ${g}[0] —— 注意参数列表中高亮变化`);
      }
    });

    l2d.load({
      path: 'https://model.hacxy.cn/shizuku/shizuku.model.json',
      scale: 0.8,
    });

    return () => {
      stopRaf();
      for (const { row } of rows.values()) row.onclick = null;
      panel.remove();
    };
  },
} satisfies Demo;
