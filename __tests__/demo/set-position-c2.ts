import type { Demo } from '../demo-types';
import { attachCanvasPositionSliders } from './utils';

export default {
  title: 'setPosition 位移 (Cubism2)',
  setup([l2d]) {
    const detach = attachCanvasPositionSliders(l2d);
    l2d.load({
      path: 'https://model.hacxy.cn/shizuku/shizuku.model.json',
      scale: 0.8,
    });
    return detach;
  },
} satisfies Demo;
