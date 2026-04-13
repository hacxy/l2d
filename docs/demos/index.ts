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

// motionstart 事件
export function demo2(init: Init, l2dCanvas: Canvas, message: MessageApiInjection) {
  const l2d = init(l2dCanvas.value);
  // #region demo2
  l2d.load({
    path: 'https://model.hacxy.cn/shizuku/shizuku.model.json',
  });

  l2d.on('motionstart', (group, index, duration, file) => {
    message.info(`动作开始: ${group}[${index}]${file ? ` - ${file}` : ''}${duration !== null ? ` (${duration}ms)` : ''}`);
  });
  // #endregion demo2
}

// 模型实例
export function demo4(init: Init, l2dCanvas: Canvas, message: MessageApiInjection) {
  const l2d = init(l2dCanvas.value);
  // #region demo4
  l2d.load({
    path: 'https://model.hacxy.cn/HK416-1-normal/model.json',
  }).then(() => {
    l2d.setPosition(0.2, -0.2); // 重新设置位置
    message.success('模型加载成功');
  });
  // #endregion demo4
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

// tap 事件
export function demo5(init: Init, l2dCanvas: Canvas, message: MessageApiInjection) {
  const l2d = init(l2dCanvas.value);
  // #region demo5
  l2d.load({
    path: 'https://model.hacxy.cn/shizuku/shizuku.model.json',
  });

  l2d.on('tap', areaName => {
    message.info(`点击区域: ${areaName}`);
  });
  // #endregion demo5
}

// loadstart 事件
export function demo6(init: Init, l2dCanvas: Canvas, message: MessageApiInjection) {
  const l2d = init(l2dCanvas.value);
  // #region demo6
  l2d.on('loadstart', total => {
    message.info(`开始加载，共 ${total} 个文件`);
  });

  l2d.load({
    path: 'https://model.hacxy.cn/cat-black/model.json',
  });
  // #endregion demo6
}

// loadprogress 事件
export function demo7(init: Init, l2dCanvas: Canvas, message: MessageApiInjection) {
  const l2d = init(l2dCanvas.value);
  // #region demo7
  let progressMsg: ReturnType<typeof message.loading> | null = null;

  l2d.on('loadprogress', (loaded, total, file) => {
    const filename = file.split('/').pop() || file;
    if (!progressMsg) {
      progressMsg = message.loading(`${loaded}/${total}  ${filename}`, { duration: 0 });
    }
    else {
      progressMsg.content = `${loaded}/${total}  ${filename}`;
    }
  });

  l2d.on('loaded', () => {
    progressMsg?.destroy();
  });

  l2d.load({
    path: 'https://model.hacxy.cn/cat-black/model.json',
  });
  // #endregion demo7
}

// loaded 事件
export function demo8(init: Init, l2dCanvas: Canvas, message: MessageApiInjection) {
  const l2d = init(l2dCanvas.value);
  // #region demo8
  l2d.on('loaded', () => {
    message.success('模型加载完成，开始渲染');
  });

  l2d.load({
    path: 'https://model.hacxy.cn/cat-black/model.json',
  });
  // #endregion demo8
}

// expressionstart 事件
export function demo9(init: Init, l2dCanvas: Canvas, message: MessageApiInjection) {
  const l2d = init(l2dCanvas.value);
  // #region demo9
  l2d.on('expressionstart', id => {
    message.info(`表情开始播放: ${id}`);
  });

  l2d.load({
    path: 'https://model.hacxy.cn/shizuku/shizuku.model.json',
  }).then(() => {
    const [first] = l2d.getExpressions();
    if (first)
      l2d.setExpression(first);
  });
  // #endregion demo9
}

// expressionend 事件
export function demo10(init: Init, l2dCanvas: Canvas, message: MessageApiInjection) {
  const l2d = init(l2dCanvas.value);
  // #region demo10
  l2d.on('expressionend', () => {
    message.info('表情播放结束');
  });

  l2d.load({
    path: 'https://model.hacxy.cn/shizuku/shizuku.model.json',
  }).then(() => {
    const [first] = l2d.getExpressions();
    if (first)
      l2d.setExpression(first);
  });
  // #endregion demo10
}

// motionend 事件
export function demo11(init: Init, l2dCanvas: Canvas, message: MessageApiInjection) {
  const l2d = init(l2dCanvas.value);
  // #region demo11
  l2d.on('motionend', (group, index, file) => {
    message.info(`动作结束: ${group}[${index}]${file ? ` - ${file}` : ''}`);
  });

  l2d.load({
    path: 'https://model.hacxy.cn/shizuku/shizuku.model.json',
  });
  // #endregion demo11
}

// destroy 事件
export function demo12(init: Init, l2dCanvas: Canvas, message: MessageApiInjection) {
  const l2d = init(l2dCanvas.value);
  // #region demo12
  l2d.on('destroy', () => {
    message.info('模型已销毁，WebGL 资源释放完成');
  });

  l2d.load({
    path: 'https://model.hacxy.cn/cat-black/model.json',
  });
  // #endregion demo12
}
