import type { Demo } from '../demo-types';
import { attachCanvasPositionSliders } from './utils';

export default {
  title: 'setPosition 位移 (Cubism6)',
  setup([l2d]) {
    const detach = attachCanvasPositionSliders(l2d);
    l2d.load({
      path: 'https://model.hacxy.cn/Mao/Mao.model3.json',
    });
    return detach;
  },
} satisfies Demo;
