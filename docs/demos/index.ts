import type { MessageApiInjection } from 'naive-ui/es/message/src/MessageProvider';
import type { L2D } from '../../dist';

interface Init { (canvas: HTMLCanvasElement): L2D }
interface Canvas { value: HTMLCanvasElement }

// 基础使用方式
export function demo1(init: Init, l2dCanvas: Canvas, message: MessageApiInjection) {
  const l2d = init(l2dCanvas.value);
  // #region demo1
  l2d.load({
    path: 'https://model.hacxy.cn/cat-black/model.json',
  }).then(() => {
    message.success('模型加载成功');
  });
  // #endregion demo1
}

// tap事件监听
export function demo2(init: Init, l2dCanvas: Canvas, message: MessageApiInjection) {
  const l2d = init(l2dCanvas.value);
  // #region demo2
  l2d.load({
    path: 'https://model.hacxy.cn/shizuku/shizuku.model.json',
    showHitAreas: true
  });

  l2d.on('tap', areaName => {
    message.info(`点击了：${areaName}`);
  });
  // #endregion demo2
}

// 切换模型
export function demo3(init: Init, l2dCanvas: Canvas, message: MessageApiInjection) {
  const l2d = init(l2dCanvas.value);
  // #region demo3
  const models = [
    'https://model.hacxy.cn/cat-black/model.json',
    'https://model.hacxy.cn/cat-white/model.json',
  ];
  let current = 0;

  l2d.load({ path: models[current] });

  let countdown = 3;
  const msg = message.info(`${countdown} 秒后切换模型`, { duration: 0 });
  const timer = setInterval(async () => {
    countdown--;
    if (countdown > 0) {
      msg.content = `${countdown} 秒后切换模型`;
    }
    else {
      clearInterval(timer);
      msg.destroy();
      current = (current + 1) % models.length;
      l2d.destroy(); // 销毁当前模型模型
      await l2d.load({ path: models[current] }); // 切换到下一个模型
      message.success('模型已切换');
    }
  }, 1000);
  // #endregion demo3
}
