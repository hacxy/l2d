import type { Demo } from '../demo-types';
import { attachMotionList } from './utils';

export default {
  title: '动作列表与播放进度 (Cubism6)',
  canvasCount: 2,
  setup([l2d1, l2d2]) {
    const cleanup1 = attachMotionList(l2d1);
    l2d1.load({ path: 'https://model.hacxy.cn/Haru/Haru.model3.json' });

    const cleanup2 = attachMotionList(l2d2);
    l2d2.load({ path: 'https://model.hacxy.cn/Mao/Mao.model3.json' });

    return () => {
      cleanup1();
      cleanup2();
    };
  },
} satisfies Demo;
