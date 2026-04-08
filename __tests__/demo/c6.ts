import { init } from '../../dist';

const canvasEl1 = document.getElementById('l2d1') as HTMLCanvasElement;

const l2d = init(canvasEl1);
l2d.load({
  // path: 'https://model.hacxy.cn/Senko_Normals/senko.model3.json',
  // path: '/models/ads_3601/normal/normal.model3.json',
  // path: '/models/79type_1402/normal/normal.model3.json',
  path: '/models/ots14_5602/normal/normal.model3.json',
  scale: 0.5,
  // path: '/models/abeikelongbi_3/abeikelongbi_3.model3.json',
  // path: '/models/cg1/cg1.model3.json',
  // path: '/models/Haru/Haru.model3.json'
  position: [1, 0]
}).then(() => {
  console.log('模型已准备就绪');
  console.log(l2d.getMotionGroups());
  console.log(l2d.getMotionFiles());

  setTimeout(() => {
    // l2d.setPosition(1, 0);
  }, 1000);
});

l2d.on('motionstart', gourp => {
  console.log(gourp);
});
