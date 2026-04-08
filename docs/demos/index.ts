import type { MessageApiInjection } from 'naive-ui/es/message/src/MessageProvider';
import type { L2D } from '../../dist';

interface Init { (canvas: HTMLCanvasElement): L2D }
interface Canvas { value: HTMLCanvasElement }

export function demo1(init: Init, l2dCanvas: Canvas, message: MessageApiInjection) {
  // #region demo1
  const l2d = init(l2dCanvas.value);
  l2d.load({
    path: 'https://model.hacxy.cn/cat-black/model.json',
  }).then(() => {
    message.success('模型加载成功');
  });
  // #endregion demo1
}
