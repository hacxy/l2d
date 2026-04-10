import type { Demo } from '../demo-types';

export default {
  title: '切换并重新加载模型',
  setup([l2d]) {
    const models = [
      'https://model.hacxy.cn/shizuku/shizuku.model.json',
      'https://model.hacxy.cn/Mao/Mao.model3.json',
      'https://model.hacxy.cn/Pio/model.json',
      'https://model.hacxy.cn/Natori/Natori.model3.json',
    ];

    const canvasItem = document.querySelector('#stage .canvas-item') as HTMLDivElement | null;
    const canvasWrapper = canvasItem?.querySelector('.canvas-wrapper') as HTMLDivElement | null;
    const panel = document.createElement('div');
    panel.style.position = 'absolute';
    panel.style.bottom = '8px';
    panel.style.left = '8px';
    panel.style.right = '8px';
    panel.style.zIndex = '2';
    panel.style.maxHeight = '140px';
    panel.style.overflow = 'auto';
    panel.style.padding = '8px';
    panel.style.border = '1px solid #444';
    panel.style.background = 'rgba(15, 15, 15, 0.8)';

    const title = document.createElement('div');
    title.textContent = '点击模型切换';
    title.style.fontSize = '12px';
    title.style.color = '#aaa';
    title.style.marginBottom = '6px';
    panel.appendChild(title);

    const list = document.createElement('ul');
    list.style.listStyle = 'none';
    list.style.padding = '0';
    list.style.margin = '0';
    list.style.display = 'grid';
    list.style.gap = '6px';
    panel.appendChild(list);

    const buttons: HTMLButtonElement[] = [];
    const getModelName = (path: string) => {
      const cleaned = path.endsWith('/') ? path.slice(0, -1) : path;
      const segments = cleaned.split('/');
      return segments.length >= 2 ? segments[segments.length - 2] : path;
    };
    const setActive = (activeIndex: number) => {
      buttons.forEach((btn, i) => {
        btn.style.fontWeight = i === activeIndex ? '600' : '400';
        btn.style.background = i === activeIndex ? '#2a2a5a' : 'transparent';
        btn.style.color = i === activeIndex ? '#9090ff' : '#ddd';
      });
    };

    const switchModel = (index: number) => {
      setActive(index);
      l2d.load({
        path: models[index],
      });
    };

    models.forEach((path, index) => {
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = getModelName(path);
      button.title = path;
      button.style.width = '100%';
      button.style.textAlign = 'left';
      button.style.fontSize = '12px';
      button.style.padding = '6px 8px';
      button.style.border = '1px solid #555';
      button.style.borderRadius = '6px';
      button.style.cursor = 'pointer';
      button.style.background = 'transparent';
      button.style.color = '#ddd';
      button.onclick = () => switchModel(index);
      buttons.push(button);
      item.appendChild(button);
      list.appendChild(item);
    });

    if (canvasWrapper)
      canvasWrapper.appendChild(panel);

    switchModel(0);

    return () => {
      buttons.forEach(btn => {
        btn.onclick = null;
      });
      panel.remove();
    };
  },
} satisfies Demo;
