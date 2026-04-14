import type { Demo } from '../demo-types';
import { attachMotionList } from './utils';

export default {
  title: '动作列表与播放进度 (Cubism2)',
  canvasCount: 2,
  setup([l2d, l2d2]) {
    const cleanup1 = attachMotionList(l2d);
    l2d.load({ path: 'https://model.hacxy.cn/HK416-1-normal/model.json' });

    const cleanup2 = attachMotionList(l2d2);
    l2d2.load({ path: 'https://model.hacxy.cn/shizuku/shizuku.model.json' });

    return () => {
      cleanup1();
      cleanup2();
    };
  },
} satisfies Demo;
