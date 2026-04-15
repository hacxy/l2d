import type { Demo } from '../demo-types';
import { createCompactListPanel, DEMO_BTN_COMPACT } from './utils/demo-list-panel';

export default {
  title: '表情切换 (Cubism2)',
  setup([l2d]) {
    const { panel, list, mount } = createCompactListPanel('表情');
    mount(l2d);

    const exprButtons = new Map<string, HTMLButtonElement>();
    let randomBtn: HTMLButtonElement | null = null;

    function paintActive(id: string | null) {
      for (const [eid, btn] of exprButtons) {
        const on = eid === id;
        btn.style.borderColor = on ? '#5a7acc' : '#555';
        btn.style.background = on ? 'rgba(40,60,120,0.25)' : 'rgba(0,0,0,0.2)';
        btn.style.fontWeight = on ? '600' : '400';
      }
    }

    function buildList() {
      list.replaceChildren();
      exprButtons.clear();
      randomBtn = null;
      paintActive(null);

      randomBtn = document.createElement('button');
      randomBtn.type = 'button';
      randomBtn.textContent = '随机';
      randomBtn.style.cssText = DEMO_BTN_COMPACT;
      randomBtn.onclick = () => l2d.setExpression();
      list.append(randomBtn);

      const ids = l2d.getExpressions();
      if (ids.length === 0) {
        const empty = document.createElement('div');
        empty.textContent = '（无表情资源）';
        empty.style.cssText = 'font-size:8px;color:#666;padding:4px 0';
        list.append(empty);
        return;
      }

      for (const id of ids) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = id;
        btn.style.cssText = DEMO_BTN_COMPACT;
        btn.onclick = () => l2d.setExpression(id);
        list.append(btn);
        exprButtons.set(id, btn);
      }
    }

    l2d.on('expressionchange', id => {
      paintActive(id);
    });

    l2d.on('loaded', buildList);

    l2d.load({
      path: 'https://model.hacxy.cn/shizuku/shizuku.model.json',
      scale: 0.8,
    });

    return () => {
      randomBtn && (randomBtn.onclick = null);
      for (const btn of exprButtons.values())
        btn.onclick = null;
      panel.remove();
    };
  },
} satisfies Demo;
