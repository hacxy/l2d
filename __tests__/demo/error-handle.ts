import type { Demo } from '../demo-types';

export default {
  title: '错误处理',
  setup([l2d]) {
    l2d.load({
      path: 'https://model.hacxy.cn/Mao/Mao.model3.json',
      scale: 0.8,
    }).then(() => {
      console.log('模型已准备就绪, ===> then');
      console.log(l2d.getMotions());
    });
  },
} satisfies Demo;
