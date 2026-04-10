import type { Demo } from '../demo-types';
import { init } from '../../dist';

export default {
  title: '多实例',
  canvasCount: 3,
  setup([canvas1, canvas2, canvas3]) {
    const l2d = init(canvas1);
    const l2d2 = init(canvas2);
    const l2d3 = init(canvas3);

    l2d.load({
      path: 'https://model.hacxy.cn/Pio/model.json',
    }).then(() => console.log('模型已准备就绪, ===> then'));

    l2d.on('motionstart', (group, index, duration, file) => {
      console.log(group, index, duration, file);
    });

    l2d2.load({
      path: 'https://model.hacxy.cn/Mao/Mao.model3.json',
    });

    l2d3.load({
      path: 'https://model.hacxy.cn/HK416-1-normal/model.json',
    });
    return () => {
      l2d.destroy();
      l2d2.destroy();
      l2d3.destroy();
    };
  },
} satisfies Demo;
