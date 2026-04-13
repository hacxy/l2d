import type { Demo } from '../demo-types';
import { modelPathLabel } from './utils/demo-helpers';
import { createWideGridListPanel } from './utils/demo-list-panel';

export default {
  title: '切换并重新加载模型',
  setup([l2d]) {
    const models = [
      'https://model.hacxy.cn/shizuku/shizuku.model.json',
      'https://model.hacxy.cn/Mao/Mao.model3.json',
      'https://model.hacxy.cn/Pio/model.json',
      'https://model.hacxy.cn/Natori/Natori.model3.json',
    ];

    const { panel, list, mount } = createWideGridListPanel('点击模型切换');
    mount(l2d);

    const buttons: HTMLButtonElement[] = [];

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
        path: models[index]!,
      });
    };

    models.forEach((path, index) => {
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = modelPathLabel(path);
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

    switchModel(0);

    return () => {
      buttons.forEach(btn => {
        btn.onclick = null;
      });
      panel.remove();
    };
  },
} satisfies Demo;
