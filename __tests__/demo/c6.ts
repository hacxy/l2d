import { init } from '../../dist';

const canvasEl1 = document.getElementById('l2d1') as HTMLCanvasElement;

const l2d = init(canvasEl1);
l2d.load({
  // path: 'https://model.hacxy.cn/Senko_Normals/senko.model3.json',
  // path: '/models/ads_3601/normal/normal.model3.json',
  // path: '/models/79type_1402/normal/normal.model3.json',
  path: '/models/ots14_5602/normal/normal.model3.json',
  // path: '/models/abeikelongbi_3/abeikelongbi_3.model3.json',
  // path: '/models/cg1/cg1.model3.json',
  // path: '/models/Haru/Haru.model3.json'
}).then(() => {
  console.log('模型已准备就绪');
  console.log(l2d.getMotionGroups());
  console.log(l2d.getMotionFiles());

  setTimeout(() => {
    l2d.playMotionByFile('motions/login.motion3');
  }, 1000);
});

l2d.on('motionstart', gourp => {
  console.log(gourp);
});
