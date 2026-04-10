import { init } from '../../dist';

const canvasEl1 = document.getElementById('l2d1') as HTMLCanvasElement;

const l2d = init(canvasEl1);
l2d.load({
  // path: 'https://model.hacxy.cn/Senko_Normals/senko.model3.json',
  // path: '/models/ads_3601/normal/normal.model3.json',
  // path: '/models/79type_1402/normal/normal.model3.json',
  // position: [-1, 0],
  // path: '/models/ots14_5602/normal/normal.model3.json',
  // scale: 1.2,
  // path: '/models/abeikelongbi_3/abeikelongbi_3.model3.json',
  // path: '/models/cg1/cg1.model3.json',
  // path: '/models/Haru/Haru.model3.json',
  path: 'https://model.hacxy.cn//Mao/Mao.model3.json',
  showHitAreas: true,
  // position: [0, 0.2]
  scale: 0.4
}).then(() => {
  console.log('模型已准备就绪');
  console.log(l2d.getMotions());
  setTimeout(() => {
    // l2d.setScale(1);
    // l2d.setPosition(1, 0);
  }, 1000);
});

l2d.on('motionstart', (group, index, duration, file) => {
  console.log(group, index, duration, file);
});
