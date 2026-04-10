import type { Demo } from '../demo-types';

export default {
  title: 'Cubism6 基础',
  setup([l2d]) {
    l2d.load({
      path: 'https://model.hacxy.cn//Mao/Mao.model3.json',
      scale: 0.4,
    }).then(() => {
      console.log('模型已准备就绪');
      console.log(l2d.getMotions());
    });

    l2d.on('motionstart', (group, index, duration, file) => {
      console.log(group, index, duration, file);
    });
  },
} satisfies Demo;
