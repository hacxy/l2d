import { init } from '../../dist';

const canvasEl1 = document.getElementById('l2d1') as HTMLCanvasElement;

const l2d = init(canvasEl1);
l2d.load({
  // path: 'https://model.hacxy.cn/Senko_Normals/senko.model3.json',
  // path: '/models/ads_3601/normal/normal.model3.json',
  path: '/models/cg1/cg1.model3.json',
  // path: '/models/Haru/Haru.model3.json'
}).then(() => {
  console.log('模型已准备就绪');
  // l2d.showHitAreas(true);
});
