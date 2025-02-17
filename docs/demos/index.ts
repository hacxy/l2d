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
