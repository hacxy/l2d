// eslint-disable-next-line antfu/no-import-dist
import type { L2D } from '../../dist';

export function demo1(init, l2dCanvas) {
  const loadModel = async () => {
    // #region demo1
    const l2d: L2D = init(l2dCanvas.value! as HTMLCanvasElement);
    l2d.create({
      path: 'https://model.hacxy.cn/cat-black/model.json',
      position: [0, 10],
      scale: 0.1
    });
    // #endregion demo1
  };
  loadModel();
}

export function demo2(init, l2dCanvas) {
// #region demo2
  const loadModel = async () => {
    const l2d: L2D = init(l2dCanvas.value! as HTMLCanvasElement);

    await l2d.create({
      path: 'https://model.hacxy.cn/cat-black/model.json',
      position: [0, 10],
      scale: 0.1
    });

    await l2d.create({
      path: 'https://model.hacxy.cn/cat-white/model.json',
      position: [150, 10],
      scale: 0.1
    });
  };
  loadModel();
// #endregion demo2
}

export async function demo3(init, l2dCanvas) {
  const l2d: L2D = init(l2dCanvas.value! as HTMLCanvasElement);
  const canvasEl = l2dCanvas.value! as HTMLCanvasElement;
  // #region demo3
  const inputEl = document.createElement('input');
  const labelEl = document.createElement('label');
  inputEl.type = 'checkbox';
  labelEl.innerHTML = '显示可点击区域';
  canvasEl.parentElement?.append(inputEl, labelEl);

  const model = await l2d.create({
    path: 'https://model.hacxy.cn/shizuku/shizuku.model.json',
  });

  inputEl.addEventListener('change', () => {
    if (inputEl.checked) {
      model.showHitAreaFrames();
    }
    else {
      model.hideHitAreaFrames();
    }
  });
  // #endregion demo3
}

export async function demo4(init, l2dCanvas) {
  const l2d: L2D = init(l2dCanvas.value! as HTMLCanvasElement);
  const canvasEl = l2dCanvas.value! as HTMLCanvasElement;

  // #region demo4
  async function tts(text: string) {
    const response = await fetch('https://tts.hacxy.cn/tts', {
      method: 'POST',
      body: JSON.stringify({
        voice: 'zh-CN-XiaoxiaoNeural',
        text,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(res => res.arrayBuffer());
      // 创建 AudioContext 实例
    const audioContext = new AudioContext();
    // 使用 decodeAudioData 解码 ArrayBuffer
    const audioBuffer = await audioContext.decodeAudioData(response);
    return audioBuffer;
  }

  const main = async () => {
    const inputEl = document.createElement('input');
    inputEl.style.backgroundColor = '#fff';
    const buttonEl = document.createElement('a');
    buttonEl.className = 'say-button';
    buttonEl.innerHTML = '说话';
    inputEl.className = 'say-input';
    inputEl.value = '这是一段文字, 用于测试口型动作同步';
    canvasEl.parentElement?.append(inputEl, buttonEl);

    const model = await l2d.create({
      path: 'https://model.hacxy.cn/kei_vowels_pro/kei_vowels_pro.model3.json',
      motionSync: 'https://model.hacxy.cn/kei_vowels_pro/kei_vowels_pro.motionsync3.json',
      scale: 0.3
    });

    buttonEl.addEventListener('click', async () => {
      const audioBuffer = await tts(inputEl.value);
      model.speak(audioBuffer);
    });
  };
  main();
  // #endregion demo4
}
