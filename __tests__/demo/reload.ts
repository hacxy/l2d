import { init } from '../../dist';

const canvasEl1 = document.getElementById('l2d1') as HTMLCanvasElement;
const l2d = init(canvasEl1);

l2d.load({
  path: 'https://model.hacxy.cn/shizuku/shizuku.model.json',
}).then(() => {
  console.log('模型已准备就绪, ===> then');
  l2d.showHitAreas(true);

  setTimeout(() => {
    l2d.load({
      path: '/models/abeikelongbi_3/abeikelongbi_3.model3.json'
    }).then(() => {
      l2d.showHitAreas(true);
    });
  }, 1000);
});
