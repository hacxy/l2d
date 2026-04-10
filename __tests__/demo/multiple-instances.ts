import type { Demo } from '../demo-types';

export default {
  title: '多实例',
  canvasCount: 4,
  setup([l2d, l2d2, l2d3, l2d4]) {
    l2d.load({
      path: 'https://model.hacxy.cn/Pio/model.json',
    }).then(() => console.log('模型已准备就绪, ===> then'));

    l2d2.load({
      path: 'https://model.hacxy.cn/Mao/Mao.model3.json',
    });
    l2d3.load({
      path: 'https://model.hacxy.cn/Natori/Natori.model3.json'
    });
    l2d4.load({
      path: 'https://model.hacxy.cn/date/model.json'
    });
  },
} satisfies Demo;
