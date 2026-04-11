import type { Demo } from '../demo-types';

export default {
  title: '多实例',
  canvasCount: 5,
  setup([l2d, l2d2, l2d3, l2d4, l2d5]) {
    l2d.load({
      path: 'https://model.hacxy.cn/Pio/model.json',
    });

    l2d2.load({
      path: 'https://model.hacxy.cn/Mao/Mao.model3.json',
    });
    l2d3.load({
      path: 'https://model.hacxy.cn/Natori/Natori.model3.json'
    });
    l2d4.load({
      path: 'https://model.hacxy.cn/date/model.json'
    });
    l2d5.load({
      path: 'https://model.hacxy.cn/uni/model.json',
    });
  },
} satisfies Demo;
