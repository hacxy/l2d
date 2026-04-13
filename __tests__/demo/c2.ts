import type { Demo } from '../demo-types';

export default {
  title: 'Cubism2 基础',
  setup([l2d]) {
    l2d.load({
      path: 'https://model.hacxy.cn/shizuku/shizuku.model.json',
    }).then(() => {
      console.log('模型已准备就绪');
    });
  },
} satisfies Demo;
