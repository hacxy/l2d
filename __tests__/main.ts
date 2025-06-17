// eslint-disable-next-line antfu/no-import-dist
import { init } from '../dist';
// import { tts } from './tts';

const l2d = init(document.getElementById('l2d') as HTMLCanvasElement);
// const btnEl = document.getElementById('btn');

async function main() {
  const model = l2d.createSync({
    // path: 'https://model.hacxy.cn/kei_vowels_pro/kei_vowels_pro.model3.json',
    // path: 'https://model.hacxy.cn/live2d_002_101/object_live2d_002_101.asset.model3.json',
    path: 'https://model.hacxy.cn/hibiki/hibiki.model.json',
    scale: 0.2
  });
  model.on('settingsJSONLoaded', () => {
    // console.log('settings json loaded');
  });

  model.on('settingsLoaded', () => {
    // console.log('settings loaded');
  });

  model.on('textureLoaded', () => {
    // console.log('texture loaded');
  });

  model.on('modelLoaded', () => {
    // console.log('model loaded');
  });

  model.on('ready', () => {
    // console.log('ready');
  });
  // model.setVolume(0);

  // model.expression('F08');
  // model.getExpressions();
  // console.log(exps);
  // model.expression('f01.mtn');
  // console.log(exps);
  // const motions = model.getMotionGroups();
  // model.showHitAreaFrames();
  // model.setParam('ParamAngleX', 20);
  // model.on('hit', () => {
  //   model.playMotion('Entry');
  // });

  // btnEl?.addEventListener('click', async () => {
  //   const audioBuffer = await tts(
  //     '你好, 欢迎使用l2d,  这是一个 live2d 口型动作同步的例子'
  //   );
  //   model.speak(audioBuffer);
  // });
}

main();
