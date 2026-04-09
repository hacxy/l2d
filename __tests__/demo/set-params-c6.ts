import { init } from '../../dist';

const canvas = document.getElementById('l2d1') as HTMLCanvasElement;
const l2d = init(canvas);

l2d.load({
  path: 'https://model.hacxy.cn/Mao/Mao.model3.json',
}).then(() => {
  console.log('Mao 加载完成，开始测试 setParams');
  l2d.setParams({
    ParamEyeLOpen: 0, // 左眼闭合
    ParamEyeROpen: 0, // 右眼闭合
    ParamA: 1, // 张嘴（嘴型 A）
    ParamAngleX: 30, // 头部向右转
  });
});
