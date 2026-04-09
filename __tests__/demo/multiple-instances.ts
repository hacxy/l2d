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
});

// l2d.on('loaded', () => {
//   const model = l2d._state.l2d2Model?.live2DMgr?.getModel();
//   if (model?.modelSetting) {
//     const ids = model.live2DModel.getModelContext()?._$aS?.map(d => d?.getDrawDataID()?.id).filter(Boolean) ?? [];

//     // 把所有 drawable 临时设为 hit_areas，名称就是 ID，方便 overlay 显示
//     model.modelSetting.json.hit_areas = ids.map(id => ({ name: id, id }));
//   }
//   setTimeout(() => {
//     l2d.showHitAreas(true);
//   }, 0);
// });

l2d.on('motionstart', (group, index, duration, file) => {
  console.log(group, index, duration, file);
});

l2d2.load({
  path: 'https://model.hacxy.cn/Mao/Mao.model3.json',
  // path: 'https://model.hacxy.cn/HK416-1-normal/model.json',
  showHitAreas: true
}).then(() => {
});
