import type { Demo } from '../demo-types';

export default {
  title: '设置参数 (Cubism6)',
  setup([l2d]) {
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
  },
} satisfies Demo;
