import type { Demo } from '../demo-types';
import { attachCanvasScaleSlider } from './utils';

export default {
  title: 'setScale 缩放 (Cubism6)',
  setup([l2d]) {
    const detach = attachCanvasScaleSlider(l2d, { min: 0.15, max: 2.5 });
    l2d.load({
      path: 'https://model.hacxy.cn/Mao/Mao.model3.json',
    });
    return detach;
  },
} satisfies Demo;
