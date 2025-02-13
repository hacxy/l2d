import { init } from '../src//index';
// import { tts } from './tts';

async function main() {
  // const btnEl = document.getElementById('btn');
  const l2d = init(document.getElementById('app') as HTMLCanvasElement);

  await l2d.create({
    path: 'https://model.hacxy.cn/kei_vowels_pro/kei_vowels_pro.model3.json',
    scale: 0.1,
    position: [30, 30]
  });

  await l2d.create({
    path: 'https://model.hacxy.cn/HK416-1-normal/model.json',
    scale: 0.06,
    position: [100, 30]
  });

  // setTimeout(() => {
  //   model1.destroy();
  //   setTimeout(() => {
  //     model2.destroy();
  //   }, 1000);
  // }, 2000);
  // await l2d.load({
  //   path: 'https://model.hacxy.cn/kei_vowels_pro/kei_vowels_pro.model3.json',
  //   motionSync: 'https://model.hacxy.cn/kei_vowels_pro/kei_vowels_pro.motionsync3.json'
  // }).then(() => {
  //   setTimeout(async () => {
  //   }, 2000);
  // });

  // btnEl?.addEventListener('click', async () => {
  //   const audioBuffer = await tts('你好, 欢迎使用l2d,  这是一个 live2d 口型动作同步的例子');

  //   await l2d.speak(audioBuffer);
  // });
  // app1.destroy();
  // // app1.moveCenter();
  // await app1.load({
  //   path: 'https://model.hacxy.cn/Pio/model.json',
  //   scale: 'auto'
  // });
  // app1?.setSize(window.innerWidth, window.innerHeight);
  // app1.setPosition(10, 10);
  // setTimeout(() => {
  //   app1.setScale(0.2);
  // }, 1000);
}

main();
