/* eslint-disable antfu/no-import-dist */

import type { L2D } from '../../dist';
import { createDiscreteApi } from 'naive-ui';
import { MotionPreload } from '../../dist';

const { message } = createDiscreteApi(['message']);

export async function demo1(init: any, l2dCanvas: any) {
  const loadModel = async () => {
    // #region demo1
    const l2d: L2D = init(l2dCanvas.value! as HTMLCanvasElement);
    l2d.create({
      path: 'https://model.hacxy.cn/cat-black/model.json',
      position: [0, 10],
      scale: 0.1
    }).then(() => {
      message.info('模型加载成功');
    });
    // #endregion demo1
  };
  loadModel();
}

export async function demo2(init: any, l2dCanvas: any) {
  const loadModel = async () => {
    const l2d: L2D = init(l2dCanvas.value! as HTMLCanvasElement);

    // #region demo2
    await l2d.create({
      path: 'https://model.hacxy.cn/cat-black/model.json',
      position: [0, 10],
      scale: 0.1
    });
    message.success('黑猫加载完成');
    await l2d.create({
      path: 'https://model.hacxy.cn/cat-white/model.json',
      position: [150, 10],
      scale: 0.1
    });
    message.success('白猫加载完成');
  };
  // #endregion demo2

  loadModel();
}

export async function demo3(init: any, l2dCanvas: any) {
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

    const model = l2d.createSync({
      path: 'https://model.hacxy.cn/kei_vowels_pro/kei_vowels_pro.model3.json',
      scale: 0.3
    });

    model.on('modelLoaded', () => {
      model.loadMotionSyncFromUrl('https://model.hacxy.cn/kei_vowels_pro/kei_vowels_pro.motionsync3.json');

      buttonEl.addEventListener('click', async () => {
        const audioBuffer = await tts(inputEl.value);
        model.speak(audioBuffer);
      });
    });
    return model;
  };
  const model = await main();
  // #endregion demo4
  return model;
}

export async function demoSync(init: any, l2dCanvas: any) {
  const loadModel = async () => {
    // #region demoSync
    const l2d: L2D = init(l2dCanvas.value! as HTMLCanvasElement);
    const model = l2d.createSync({
      path: 'https://model.hacxy.cn/cat-black/model.json',
      position: [0, 10],
      scale: 'auto'
    });

    model.on('settingsJSONLoaded', () => {
      message.info('settings json 加载完成');
    });
    model.on('settingsLoaded', () => {
      message.info('settings 加载完成');
    });

    model.on('textureLoaded', () => {
      message.info('纹理资源加载完成');
    });

    model.on('modelLoaded', () => {
      message.info('模型加载完成');
      // 在这个事件被调用时, 可以执行模型相关操作
      model.setScale(0.1);

      setTimeout(() => {
        model.setScale('auto');
      }, 300);
    });

    model.on('ready', () => {
      message.info('所有资源准备完毕');
      // ready事件中执行模型相关操作将更安全
    });
    // #endregion demoSync

    return model;
  };
  const model = loadModel();
  return model;
}

export async function demo5(init: any, l2dCanvas: any) {
  const loadModel = async () => {
    // #region demo5
    const l2d: L2D = init(l2dCanvas.value! as HTMLCanvasElement);
    const model = await l2d.create({
      path: 'https://model.hacxy.cn/cat-black/model.json',
      position: [0, 10],
      scale: 'auto'
    });

    model.on('settingsJSONLoaded', () => {
      message.info('settings json 加载完成');
      // 该事件将被跳过, 因此不会执行
    });
    model.on('settingsLoaded', () => {
      message.info('settings 加载完成');
      // 该事件将被跳过, 因此不会执行
    });

    model.on('textureLoaded', () => {
      message.info('纹理资源加载完成');
    });

    model.on('modelLoaded', () => {
      message.info('模型加载完成');
      // 在这个事件被调用时, 可以执行模型相关操作
      model.setScale(0.1);

      setTimeout(() => {
        model.setScale('auto');
      }, 300);

      // 该事件将被跳过, 因此不会执行
    });

    model.on('ready', () => {
      message.info('所有资源准备完毕');
      // ready事件中执行模型相关操作将更安全
    });
    // #endregion demo5

    return model;
  };
  loadModel();
}

export async function demo6(init: any, l2dCanvas: any) {
  const loadModel = async () => {
    const l2d: L2D = init(l2dCanvas.value! as HTMLCanvasElement);
    // #region demo6
    await l2d.create({
      path: 'https://model.hacxy.cn/cat-black/model.json',
      position: [0, 10],
      scale: 0.1
    });

    l2d.createSync({
      path: 'https://model.hacxy.cn/cat-white/model.json',
      position: [150, 10],
      scale: 0.1
    });
    // #endregion demo6
  };
  loadModel();
}

export async function demo7(init: any, l2dCanvas: any) {
  const l2d: L2D = init(l2dCanvas.value! as HTMLCanvasElement);
  const canvasEl = l2dCanvas.value! as HTMLCanvasElement;
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

  // #region demo7
  model.on('hit', area => {
    message.info(`${JSON.stringify(area)}被点击了`);
  });
  // #endregion demo7
}

export async function demo8(init: any, l2dCanvas: any) {
  const loadModel = async () => {
    const l2d: L2D = init(l2dCanvas.value! as HTMLCanvasElement);
    // #region demo8
    await l2d.create({
      path: 'https://model.hacxy.cn/cat-black/model.json',
      motionPreload: MotionPreload.ALL, // [!code focus]
      position: [0, 10],
      scale: 0.1
    });
    // #endregion demo8
  };
  loadModel();
}

