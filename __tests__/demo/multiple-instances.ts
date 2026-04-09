import { init } from '../../dist';

const canvasEl1 = document.getElementById('l2d1') as HTMLCanvasElement;
const canvasEl2 = document.getElementById('l2d2') as HTMLCanvasElement;
const l2d = init(canvasEl1);
const l2d2 = init(canvasEl2);

l2d.load({
  // path: 'https://model.hacxy.cn/shizuku/shizuku.model.json',
  path: 'https://model.hacxy.cn/Pio/model.json'
}).then(() => {
  console.log('模型已准备就绪, ===> then');
  l2d.showHitAreas(true);
  console.log(l2d.getMotionFiles());
  setTimeout(() => {
    // l2d.setScale(0.5);
    // l2d.setPosition(1, 0);
    l2d.playMotionByFile('motions/flickHead_00.mtn');
  }, 1000);
});

l2d.on('motionstart', (group, index, duration, file) => {
  console.log(group, index, duration, file);
});

l2d2.load({
  path: 'https://model.hacxy.cn/Mao/Mao.model3.json',
  // path: 'https://model.hacxy.cn/HK416-1-normal/model.json',
  showHitAreas: true
}).then(() => {
});
