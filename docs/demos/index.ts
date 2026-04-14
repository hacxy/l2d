/* eslint-disable max-lines */
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
  }).catch(err => {
    console.error('模型加载失败', err);
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
  l2d.on('expressionchange', id => {
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

// 可视化点击区域
export function demoHitArea(init: Init, l2dCanvas: Canvas, message: MessageApiInjection) {
  const l2d = init(l2dCanvas.value);

  const overlay = document.createElement('canvas');
  overlay.style.cssText = 'position:fixed;top:0;left:0;pointer-events:none;z-index:99999;';
  document.body.appendChild(overlay);
  const ctx = overlay.getContext('2d')!;
  let rafId: number | null = null;

  // #region demoHitArea
  l2d.on('tap', areaName => {
    message.info(`点击区域: ${areaName || '(无名区域)'}`);
  });

  l2d.load({
    path: 'https://model.hacxy.cn/shizuku/shizuku.model.json',
    scale: 0.8,
  }).then(() => {
    const canvas = l2d.getCanvas();
    const dpr = window.devicePixelRatio || 1;

    function draw() {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width * dpr;
      const h = rect.height * dpr;

      if (overlay.width !== w || overlay.height !== h) {
        overlay.width = w;
        overlay.height = h;
      }
      overlay.style.left = `${rect.left}px`;
      overlay.style.top = `${rect.top}px`;
      overlay.style.width = `${rect.width}px`;
      overlay.style.height = `${rect.height}px`;

      ctx.clearRect(0, 0, w, h);

      for (const b of l2d.getHitAreaBounds()) {
        const x = b.x * w;
        const y = b.y * h;
        const bw = b.w * w;
        const bh = b.h * h;

        ctx.strokeStyle = 'rgba(0,255,100,0.9)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, bw, bh);

        ctx.fillStyle = 'rgba(0,255,100,0.12)';
        ctx.fillRect(x, y, bw, bh);

        ctx.fillStyle = 'rgba(0,255,100,1)';
        ctx.font = `bold ${12 * dpr}px monospace`;
        ctx.fillText(b.name, x + 4, y + 14 * dpr);
      }

      rafId = requestAnimationFrame(draw);
    }

    draw();
    message.success('加载完成！点击绿色区域试试');
  });
  // #endregion demoHitArea

  return {
    onClose() {
      if (rafId !== null)
        cancelAnimationFrame(rafId);
      overlay.remove();
    },
  };
}

// 口型同步
export function demoLipSync(init: Init, l2dCanvas: Canvas, message: MessageApiInjection) {
  const l2d = init(l2dCanvas.value);
  let charTimer: ReturnType<typeof setTimeout> | null = null;
  let mouthTimer: ReturnType<typeof setTimeout> | null = null;
  let rafId: number | null = null;
  let speaking = false;

  // 创建覆盖在 canvas 上的 UI 面板，追加到 canvas 父元素内保持在模态框 DOM 树中
  const parent = l2dCanvas.value.parentElement!;
  if (getComputedStyle(parent).position === 'static')
    parent.style.position = 'relative';

  const panel = document.createElement('div');
  panel.style.cssText = 'position:absolute;inset:0;z-index:10;pointer-events:none;';
  parent.appendChild(panel);

  const bubble = document.createElement('div');
  bubble.style.cssText = [
    'position:absolute;left:12px;right:12px;bottom:56px;',
    'background:rgba(0,0,0,0.75);color:#fff;',
    'padding:10px 14px;border-radius:8px;',
    'font-size:14px;line-height:1.6;display:none;word-break:break-all;',
  ].join('');

  const inputRow = document.createElement('div');
  inputRow.style.cssText = 'position:absolute;left:12px;right:12px;bottom:12px;display:flex;gap:8px;pointer-events:auto;';

  const textInput = document.createElement('input');
  textInput.type = 'text';
  textInput.placeholder = '输入内容，按回车发送...';
  textInput.style.cssText = [
    'flex:1;padding:6px 10px;border-radius:4px;',
    'border:1px solid #555;background:#1a1a1a;',
    'color:#fff;font-size:13px;outline:none;',
  ].join('');

  const submitBtn = document.createElement('button');
  submitBtn.textContent = '发送';
  submitBtn.style.cssText = [
    'padding:6px 16px;border-radius:4px;border:none;',
    'background:#5555ff;color:#fff;font-size:13px;cursor:pointer;white-space:nowrap;',
  ].join('');

  inputRow.append(textInput, submitBtn);
  panel.append(bubble, inputRow);

  // #region demoLipSync
  let currentVal = 0;
  let targetVal = 0;
  let mouthOpen = false;

  // 每帧插值；speaking=false 且值收敛后自动停止
  function mouthLoop() {
    currentVal += (targetVal - currentVal) * 0.15;
    l2d.setParams({ PARAM_MOUTH_OPEN_Y: currentVal });
    if (speaking || currentVal > 0.01) {
      rafId = requestAnimationFrame(mouthLoop);
    }
    else {
      rafId = null;
      l2d.setParams({ PARAM_MOUTH_OPEN_Y: 0 });
    }
  }

  // 随机间隔切换目标值：开口幅度随机，闭口保留少许开合
  function scheduleMouthFlip() {
    mouthOpen = !mouthOpen;
    targetVal = mouthOpen
      ? Math.random() * 0.5 + 0.5 // 开口：0.5 ~ 1.0
      : Math.random() * 0.25; // 闭口：0 ~ 0.25
    mouthTimer = setTimeout(scheduleMouthFlip, 100 + Math.random() * 80);
  }

  function speak(text: string) {
    // 打断上一次，立即重置
    if (charTimer !== null) {
      clearTimeout(charTimer);
      charTimer = null;
    }
    if (mouthTimer !== null) {
      clearTimeout(mouthTimer);
      mouthTimer = null;
    }
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    let charIndex = 0;
    currentVal = 0;
    targetVal = 0;
    mouthOpen = false;
    speaking = true;
    bubble.style.display = 'block';
    bubble.textContent = '';

    mouthLoop();
    scheduleMouthFlip();

    // 逐字显示文本
    function showNextChar() {
      bubble.textContent = text.slice(0, charIndex + 1);
      charIndex++;
      if (charIndex < text.length) {
        charTimer = setTimeout(showNextChar, 180);
      }
      else {
        // 文字显示完毕，停止口型；mouthLoop 将平滑收敛到 0 后自止
        if (mouthTimer !== null) {
          clearTimeout(mouthTimer);
          mouthTimer = null;
        }
        speaking = false;
        targetVal = 0;
      }
    }
    showNextChar();
  }

  l2d.load({
    path: 'https://model.hacxy.cn/shizuku/shizuku.model.json',
    scale: 0.8,
  }).then(() => {
    message.success('加载完成，输入文字后点击发送！');
    textInput.focus();
  });
  // #endregion demoLipSync

  submitBtn.addEventListener('click', () => {
    const text = textInput.value.trim();
    if (!text)
      return;
    textInput.value = '';
    speak(text);
  });

  textInput.addEventListener('keydown', e => {
    if (e.key === 'Enter')
      submitBtn.click();
  });

  return {
    onClose() {
      if (charTimer !== null)
        clearTimeout(charTimer);
      if (mouthTimer !== null)
        clearTimeout(mouthTimer);
      if (rafId !== null)
        cancelAnimationFrame(rafId);
      panel.remove();
    },
  };
}
