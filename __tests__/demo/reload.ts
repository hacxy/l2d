import type { Demo } from '../demo-types';
import { init } from '../../dist';

export default {
  title: '重新加载模型',
  setup([canvas]) {
    const l2d = init(canvas);
    let timerId: ReturnType<typeof setTimeout> | null = null;
    l2d.load({
      path: 'https://model.hacxy.cn/shizuku/shizuku.model.json',
    }).then(() => {
      timerId = setTimeout(() => {
        l2d.load({
          path: 'https://model.hacxy.cn//Mao/Mao.model3.json',
        });
      }, 3000);
    });

    return () => {
      if (timerId !== null) {
        clearTimeout(timerId);
        l2d.destroy();
      }
    };
  },
} satisfies Demo;
