import { init } from '../src';

async function main() {
  const app1 = init(document.getElementById('app'));
  // const app2 = init(document.getElementById('main'));
  // init(document.getElementById('main2'));
  // init(document.getElementById('main3'));
  await app1?.loadModel({
    path: 'https://model.hacxy.cn/HK416-1-normal/model.json',
    scale: 0.1
  });

  // await app1.loadModel({
  //   path: 'https://model.hacxy.cn/Pio/model.json',
  //   scale: 0.1
  // });
  app1?.setSize(window.innerWidth, window.innerHeight);
  // app1.setPosition(10, 10);
  // setTimeout(() => {
  //   app1.setScale(0.2);
  // }, 1000);
}

main();
