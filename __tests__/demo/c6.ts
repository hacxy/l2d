import type { Demo } from '../demo-types';

export default {
  title: 'Cubism6 基础',
  setup([l2d]) {
    l2d.load({
      path: 'https://model.hacxy.cn//Mao/Mao.model3.json',
    }).then(() => {
      console.log('模型已准备就绪');
    });
  },
} satisfies Demo;
