import type { Demo } from '../demo-types';
import { attachMotionList } from './utils';

export default {
  title: 'setVolume 音量 (Cubism6)',
  setup([l2d]) {
    const detach = attachMotionList(l2d, { volume: true });
    l2d.load({ path: 'https://model.hacxy.cn/Haru/Haru.model3.json' });
    return detach;
  },
} satisfies Demo;
