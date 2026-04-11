import type { Demo } from '../demo-types';
import { attachCanvasScaleSlider } from './utils';

export default {
  title: 'setScale 缩放 (Cubism2)',
  setup([l2d]) {
    const detach = attachCanvasScaleSlider(l2d, { min: 0.15, max: 2.5 });
    l2d.load({
      path: 'https://model.hacxy.cn/shizuku/shizuku.model.json',
    });
    return detach;
  },
} satisfies Demo;
