import type { Demo } from '../demo-types';
import { init } from '../../dist';

export default {
  title: '错误处理',
  setup([canvas]) {
    const l2d = init(canvas);

    l2d.load({
      path: 'https://model.hacxy.cn/Mao/Mao.model3.json',
      scale: 0.8,
    }).then(() => {
      console.log('模型已准备就绪, ===> then');
      console.log(l2d.getMotions());
    });

    return () => l2d.destroy();
  },
} satisfies Demo;
