import type { Demo } from '../demo-types';

export default {
  title: '多实例',
  canvasCount: 2,
  setup([l2d, l2d2]) {
    l2d.load({
      path: 'https://model.hacxy.cn/Pio/model.json',
    }).then(() => console.log('模型已准备就绪, ===> then'));

    l2d.on('motionstart', (group, index, duration, file) => {
      console.log(group, index, duration, file);
    });

    l2d2.load({
      path: 'https://model.hacxy.cn/Mao/Mao.model3.json',
    });
  },
} satisfies Demo;
