import type { Demo } from '../demo-types';
import { init } from '../../dist';

export default {
  title: '设置参数 (Cubism6)',
  setup([canvas]) {
    const l2d = init(canvas);

    l2d.load({
      path: 'https://model.hacxy.cn/Mao/Mao.model3.json',
    }).then(() => {
      console.log('Mao 加载完成，开始测试 setParams');
      l2d.setParams({
        ParamEyeLOpen: 0,
        ParamEyeROpen: 0,
        ParamA: 1,
        ParamAngleX: 30,
      });
    });

    return () => l2d.destroy();
  },
} satisfies Demo;
