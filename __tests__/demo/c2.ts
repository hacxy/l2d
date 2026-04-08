import { init } from '../../dist';

const canvasEl1 = document.getElementById('l2d1') as HTMLCanvasElement;
// const canvasEl2 = document.getElementById('l2d2') as HTMLCanvasElement;
const l2d = init(canvasEl1);
// const l2d2 = init(canvasEl2);

l2d.load({
  path: 'https://model.hacxy.cn/shizuku/shizuku.model.json',
  position: [1, 0],
  scale: 0.5
}).then(() => {
  console.log('模型已准备就绪, ===> then');
  l2d.showHitAreas(true);
  console.log(l2d.getMotionFiles());
  setTimeout(() => {
  }, 1000);
});

l2d.on('tap', () => {
  l2d.playMotionByFile('motions/flickHead_00');
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
// l2d2.load({
//   path: 'models/noir_santa/index.json',
//   scale: 1.2
// }).then(() => {
//   l2d2.showHitAreas(true);
// });
l2d.on('loadstart', total => {
  console.log('start', total);
});
l2d.on('loadprogress', (loaded, total, file) => {
  console.log(file);
});
// l2d.on('tap', () => {
//   l2d.playMotion('tap_body', 1);
// });
// l2d.on('motionstart', (group, index, duration) => {
//   console.log(`motion  ${group} - ${index} start`, duration);
//   setTimeout(() => {
//     console.log(`motion ${group} - ${index} end ======>`);
//   }, duration ? duration * 1000 : 0);
// });
// l2d.on('motionend', (group, index) => {
//   console.log(group, index);
// });
l2d.on('loaded', () => {
  console.log('模型已准备就绪, ===> event');
});
