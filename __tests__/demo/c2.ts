import { init } from '../../dist';

const canvasEl1 = document.getElementById('l2d1') as HTMLCanvasElement;
const canvasEl2 = document.getElementById('l2d2') as HTMLCanvasElement;
const l2d = init(canvasEl1);
const l2d2 = init(canvasEl2);

l2d.load({
  path: 'https://model.hacxy.cn/shizuku/shizuku.model.json',
}).then(() => {
  console.log('模型已准备就绪, ===> then');
  l2d.showHitAreas(true);
});

// l2d.on('motionstart', (group, index) => {
//   console.log(group, index);
// });

// l2d.on('expressionstart', id => {
//   console.log(id);
// });
l2d.on('tap', areaName => {
  console.log(areaName);
});
l2d2.load({
  path: 'https://model.hacxy.cn/cat-black/model.json',
}).then(() => {
  l2d2.showHitAreas(true);
});

l2d.on('loaded', () => {
  console.log('模型已准备就绪, ===> event');
});
