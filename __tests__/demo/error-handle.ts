import { init } from '../../dist';

const canvasEl1 = document.getElementById('l2d1') as HTMLCanvasElement;
const l2d = init(canvasEl1);

l2d.load({
  path: 'https://model.hacxy.cn/Mao/Mao.model3.json',
  // path: 'https://model.hacxy.cn/HK416-1-normal/model.json',
  // path: 'https://model.hacxy.cn/shizuku/shizuku.model.json',
  scale: 0.8,
  // path: 'https://model.hacxy.cn/bilibili-22/index.json',
}).then(() => {
  console.log('模型已准备就绪, ===> then');
  l2d.showHitAreas(true);
  console.log(l2d.getMotionFiles());
  console.log(l2d.getMotionGroups());
  setTimeout(() => {
    // l2d.setScale(0.5);
    // l2d.setPosition(1, 0);

    // l2d.playMotionByFile('motions/mtn_02.motion3333');
    // l2d.playMotion('TapBody', 0);
  }, 1000);
});
