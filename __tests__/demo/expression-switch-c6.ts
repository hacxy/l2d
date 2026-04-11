import type { Demo } from '../demo-types';

const BTN_BASE
  = 'width:100%;padding:4px 6px;border:1px solid #555;border-radius:3px;cursor:pointer;text-align:left;font-family:ui-monospace,monospace;font-size:8px;color:#ccc;background:rgba(0,0,0,0.2)';

export default {
  title: '表情切换 (Cubism6)',
  setup([l2d]) {
    const wrap = l2d.getCanvas().parentElement as HTMLElement | null;

    const panel = document.createElement('div');
    panel.style.cssText
      = 'position:absolute;bottom:6px;left:6px;right:6px;z-index:2;max-height:min(132px,38%);overflow:auto;padding:5px 6px;border:1px solid #444;border-radius:5px;background:rgba(12,12,12,0.88);box-sizing:border-box';

    const heading = document.createElement('div');
    heading.textContent = '表情';
    heading.style.cssText = 'font-size:9px;color:#777;margin-bottom:5px;font-family:system-ui,sans-serif';

    const list = document.createElement('div');
    list.style.cssText = 'display:flex;flex-direction:column;gap:4px';
    panel.append(heading, list);

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
      randomBtn.style.cssText = BTN_BASE;
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
        btn.style.cssText = BTN_BASE;
        btn.onclick = () => l2d.setExpression(id);
        list.append(btn);
        exprButtons.set(id, btn);
      }
    }

    l2d.on('expressionstart', id => {
      paintActive(id);
    });

    l2d.on('loaded', buildList);

    wrap?.append(panel);
    l2d.load({ path: 'https://model.hacxy.cn/Mao/Mao.model3.json' });

    return () => {
      randomBtn && (randomBtn.onclick = null);
      for (const btn of exprButtons.values())
        btn.onclick = null;
      panel.remove();
    };
  },
} satisfies Demo;
