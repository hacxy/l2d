// eslint-disable-next-line antfu/no-import-dist
import { init } from '../dist';
import { tts } from './tts';

const l2d = init(document.getElementById('l2d') as HTMLCanvasElement);
const btnEl = document.getElementById('btn');

// const modelPathPrefix = 'https://model.hacxy.cn/kei_vowels_pro/';

async function main() {
  const model = await l2d.create({
    path: 'https://model.hacxy.cn/shizuku/shizuku.model.json',
    // motionSync: `${modelPathPrefix}kei_vowels_pro.motionsync3.json`,
  });
  model.setVolume(0);
  // const motions = model.getMotionGroups();
  model.on('hit', () => {
    model.playMotion('flick_head');
  });

  btnEl?.addEventListener('click', async () => {
    const audioBuffer = await tts(
      '你好, 欢迎使用l2d,  这是一个 live2d 口型动作同步的例子'
    );
    model.speak(audioBuffer);
  });
}

main();
