// eslint-disable-next-line antfu/no-import-dist
import { init } from '../dist/index.js';
// import { tts } from './tts';

// 确保 DOM 加载完成后再初始化
async function main() {
  // 等待 DOM 加载完成
  if (document.readyState === 'loading') {
    await new Promise(resolve => {
      document.addEventListener('DOMContentLoaded', resolve);
    });
  }

  // 等待一小段时间确保所有元素都已渲染
  await new Promise(resolve => setTimeout(resolve, 100));

  // 获取 canvas 元素
  const canvasEl = document.getElementById('l2d') as HTMLCanvasElement | null;
  if (!canvasEl) {
    console.error('无法找到 canvas 元素 (id: l2d)');
    return;
  }

  // 初始化 Live2D
  const l2d = init(canvasEl);
  console.log('Live2D 初始化完成', l2d);
}

main().catch(error => {
  console.error('初始化失败:', error);
});
// const btnEl = document.getElementById('btn');

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
