import { init } from '../../dist';

const canvasEl1 = document.getElementById('l2d1') as HTMLCanvasElement;

const l2d = init(canvasEl1);

l2d.load({
  path: 'https://model.hacxy.cn/Senko_Normals/senko.model3.json',
  // path: 'https://cdn.jsdelivr.net/gh/Eikanya/Live2d-model/%E5%B0%91%E5%A5%B3%E5%89%8D%E7%BA%BF%20girls%20Frontline/live2dnew/79type_1402/normal/normal.model3.json'
}).then(() => {
  console.log('模型已准备就绪');
  l2d.showHitAreas(true);
  const motionGroup = l2d.getMotionGroups();
  console.log(motionGroup);
});

l2d.on('tap', areaName => {
  console.log(areaName);
  // l2d.playMotion('Tap');
});
l2d.on('motionstart', (group, index, duration) => {
  console.log(group, index, duration);
});
