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
