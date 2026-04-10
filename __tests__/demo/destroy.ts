import { init } from '../../dist';

const canvasEl1 = document.getElementById('l2d1') as HTMLCanvasElement;
// const canvasEl2 = document.getElementById('l2d2') as HTMLCanvasElement;
const l2d = init(canvasEl1);
// const l2d2 = init(canvasEl2);

l2d.load({
  // path: 'https://model.hacxy.cn/Mao/Mao.model3.json',
  path: 'https://model.hacxy.cn/HK416-1-normal/model.json',
  // path: 'https://model.hacxy.cn/shizuku/shizuku.model.json',
  // path: 'https://model.hacxy.cn/bilibili-22/index.json',
}).then(() => {
  setTimeout(() => {
    l2d.destroy();
  }, 1000);
});

l2d.on('destroy', () => {
  console.log('模型已被销毁');
});
