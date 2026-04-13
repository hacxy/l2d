import type { Demo } from '../demo-types';

export default {
  title: '设置参数 (Cubism2)',
  setup([l2d]) {
    l2d.load({
      path: 'https://model.hacxy.cn/shizuku/shizuku.model.json',
      scale: 0.8,
    }).then(() => {
      console.log('shizuku 加载完成，开始测试 setParams');
      l2d.setParams({
        PARAM_EYE_L_OPEN: 0,
        PARAM_EYE_R_OPEN: 0,
        PARAM_MOUTH_OPEN_Y: 1,
        PARAM_MOUTH_FORM: 1,
        PARAM_ANGLE_X: 13,
        PARAM_ANGLE_Y: -19,
      });
    });
  },
} satisfies Demo;
