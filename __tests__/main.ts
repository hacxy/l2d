// eslint-disable-next-line antfu/no-import-dist
import { init } from '../dist/index.js';
// import { tts } from './tts';

// 确保 DOM 加载完成后再初始化
async function main() {
  const l2d = init(document.getElementById('l2d1') as HTMLCanvasElement);
  // const l2d2 = init(document.getElementById('l2d') as HTMLCanvasElement);
  // const l2d3 = init(document.getElementById('l2d3') as HTMLCanvasElement);
  // l2d3.create({
  //   // path: 'https://model.hacxy.cn/cat-black/model.json',
  //   path: 'https://model.hacxy.cn/Senko_Normals/senko.model3.json',
  // });
  l2d.create({
    path: 'https://model.hacxy.cn/tia/model.json',
    // path: 'https://model.hacxy.cn/shizuku/shizuku.model.json',
    // path: 'https://model.hacxy.cn/Senko_Normals/senko.model3.json',
    loading: {
      background: 'red'
    },
    height: 150
    // path: 'https://model.hacxy.cn/cat-black/model.json',
    // path: 'https://model.hacxy.cn/Pio/model.json',
    // path: 'https://model.hacxy.cn/Pio/model.json',
    // position: [0.5, -0.5]
    // width: 300,
    // height: 300,
    // scale: 1
  }).then(() => {
    // console.log('模型已加载');
  });
  // l2d.on('tap', areaName => {
  //   console.log(areaName, '被点击');
  // });
  // l2d.on('loaded', () => {
  //   console.log('模型加载完成');
  //   l2d.showHitAreas(true);
  // });
  // l2d.on('hover', areaName => {
  //   console.log(areaName, '被hover');
  // });
  // l2d.on('modelfileloaded', () => {
  //   console.log('modelfile加载完成');
  // });
  // l2d.on('texturesloaded', () => {
  //   console.log('texture加载成功');
  // });

  // setTimeout(() => {
  //   l2d.showHitAreas(false);
  // }, 5000);

  // l2d2.create({
  //   path: 'https://model.hacxy.cn/Senko_Normals/senko.model3.json',
  //   // path: 'https://model.hacxy.cn/cat-black/model.json',
  //   // path: 'https://model.hacxy.cn/kei_vowels_pro/kei_vowels_pro.model3.json'
  //   // path: 'https://model.hacxy.cn/Pio/model.json',
  // });
  // l2d2.showHitAreas(true);
}

main().catch(error => {
  console.error('初始化失败:', error);
});

// async function main() {
//   const model = l2d.createSync({
//     // path: 'https://model.hacxy.cn/kei_vowels_pro/kei_vowels_pro.model3.json',
//     // path: 'https://model.hacxy.cn/live2d_002_101/object_live2d_002_101.asset.model3.json',
//     path: 'https://model.hacxy.cn/hibiki/hibiki.model.json',
//     scale: 0.2
//   });
//   model.on('settingsJSONLoaded', () => {
//     // console.log('settings json loaded');
//   });

//   model.on('settingsLoaded', () => {
//     // console.log('settings loaded');
//   });

//   model.on('textureLoaded', () => {
//     // console.log('texture loaded');
//   });

//   model.on('modelLoaded', () => {
//     // console.log('model loaded');
//   });

//   model.on('ready', () => {
//     // console.log('ready');
//   });
//   // model.setVolume(0);

//   // model.expression('F08');
//   // model.getExpressions();
//   // console.log(exps);
//   // model.expression('f01.mtn');
//   // console.log(exps);
//   // const motions = model.getMotionGroups();
//   // model.showHitAreaFrames();
//   // model.setParam('ParamAngleX', 20);
//   // model.on('hit', () => {
//   //   model.playMotion('Entry');
//   // });

//   // btnEl?.addEventListener('click', async () => {
//   //   const audioBuffer = await tts(
//   //     '你好, 欢迎使用l2d,  这是一个 live2d 口型动作同步的例子'
//   //   );
//   //   model.speak(audioBuffer);
//   // });
// }

// main();
