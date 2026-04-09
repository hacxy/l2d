import { init } from '../../dist';

const canvas = document.getElementById('l2d1') as HTMLCanvasElement;
const l2d = init(canvas);

l2d.load({
  path: 'https://model.hacxy.cn/shizuku/shizuku.model.json',
  scale: 0.8,
}).then(() => {
  console.log('shizuku 加载完成，开始测试 setParams');
  l2d.setParams({
    PARAM_EYE_L_OPEN: 0, // 左眼闭合（0=闭，1=开）
    PARAM_EYE_R_OPEN: 0, // 右眼闭合
    PARAM_MOUTH_OPEN_Y: 1, // 张嘴（0=闭，1=全开）
    PARAM_MOUTH_FORM: 1, // 嘴形（1=笑）
    PARAM_ANGLE_X: 13, // 头部向右转（最大值约 ±13）
    PARAM_ANGLE_Y: -19, // 头部向下（最大值约 ±19）
  });
});
