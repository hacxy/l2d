---
sidebar:
  sort: 3
---

# 口型动作同步

本教程实现一个常见的互动效果：用户输入一段文字并提交后，模型以逐字显示的方式"朗读"文本，同时配合口型开合动作，营造说话的视觉效果。

> **关于官方 MotionSync**
>
> Live2D Cubism SDK 官方提供了 [MotionSync](https://docs.live2d.com/en/cubism-sdk-manual/motion-sync-setting-web/) 能力，可以根据音频波形实时驱动口型，效果更为精准自然。但该功能需要模型本身内置 MotionSync 配置文件，并非所有模型都支持。
>
> 本教程使用 `setParams()` 手动控制嘴巴参数的方案，**无需模型有任何特殊配置**，可在任意 Cubism 2 / 6 模型上模拟出口型动作同步的效果。

## 如何查找嘴巴参数名

`setParams()` 需要传入模型定义的参数 ID，不同模型的参数名称各不相同。查找方式如下：

- **Cubism 2 模型**：打开模型目录下任意一个 `.mtn` 动作文件（文本格式），其中 `$curve` 段的每行开头即为参数 ID，例如 `PARAM_MOUTH_OPEN_Y`。
- **Cubism 6 模型**：打开模型目录下任意一个 `.motion3.json` 动作文件，找到 `"Curves"` 数组，每个对象的 `"Id"` 即为参数名。

常见模型的嘴巴开合参数：

| 模型版本 | 常见参数名           | 值范围               |
| -------- | -------------------- | -------------------- |
| Cubism 2 | `PARAM_MOUTH_OPEN_Y` | 0（关闭）~ 1（全开） |
| Cubism 6 | `ParamA`             | 0（关闭）~ 1（全开） |

> 参数名区分大小写，且因模型而异。如果设置后没有效果，请先用 `console.log` 打印参数名确认拼写正确。

## 核心原理

l2d 的 `setParams()` 方法可以直接设置模型的参数值，通过控制**嘴巴开合参数**并与文字显示的节奏配合，即可实现口型同步效果：

- **逐字显示**：用 `setTimeout` 递归，每次多展示一个字符
- **随机化目标值**：切换"开/闭"时从随机范围采样，让每次张口幅度有所不同
- **插值平滑过渡**：用 `requestAnimationFrame` 每帧对当前值做线性插值（lerp），避免参数突变造成的机械感
- **自动收敛停止**：文字显示完毕后将目标值归零，动画循环在值收敛到 0 后自动停止

## 完整实现

### HTML 结构

```html
<div id="app">
  <div style="position: relative; display: inline-block">
    <canvas id="l2d" style="width: 300px; height: 400px"></canvas>
    <!-- 说话气泡，初始隐藏 -->
    <div
      id="speech-bubble"
      style="
        display: none;
        position: absolute;
        bottom: 80px;
        left: 12px;
        right: 12px;
        background: rgba(0, 0, 0, 0.7);
        color: #fff;
        padding: 10px 14px;
        border-radius: 8px;
        font-size: 14px;
        line-height: 1.6;
        word-break: break-all;
      "
    ></div>
  </div>
  <div style="display: flex; gap: 8px; margin-top: 8px; width: 300px">
    <input
      type="text"
      id="text-input"
      placeholder="输入内容，按回车发送..."
      style="flex: 1; padding: 6px 10px; border-radius: 4px; border: 1px solid #ccc; font-size: 13px"
    />
    <button
      id="submit-btn"
      style="padding: 6px 16px; border-radius: 4px; border: none; background: #5555ff; color: #fff; cursor: pointer"
    >
      发送
    </button>
  </div>
</div>
```

### JavaScript 逻辑

```ts
import { init } from 'l2d';

const l2d = init(document.getElementById('l2d') as HTMLCanvasElement);
const textInput = document.getElementById('text-input') as HTMLInputElement;
const submitBtn = document.getElementById('submit-btn') as HTMLButtonElement;
const bubble = document.getElementById('speech-bubble') as HTMLDivElement;

let charTimer: ReturnType<typeof setTimeout> | null = null;
let mouthTimer: ReturnType<typeof setTimeout> | null = null;
let rafId: number | null = null;
let speaking = false;
let currentVal = 0; // 当前参数值（插值中间态）
let targetVal = 0; // 目标值（每次切换后设定）
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
    bubble.style.display = 'none'; // 说完后隐藏气泡
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
  bubble.style.display = 'block'; // 显示气泡
  bubble.textContent = '';

  mouthLoop();
  scheduleMouthFlip();

  // 递归逐字显示
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
});

submitBtn.addEventListener('click', () => {
  const text = textInput.value.trim();
  if (!text)
    return;
  textInput.value = '';
  speak(text);
});

// 支持回车提交
textInput.addEventListener('keydown', e => {
  if (e.key === 'Enter')
    submitBtn.click();
});
```

> 如果使用 Cubism 6 模型，将 `PARAM_MOUTH_OPEN_Y` 替换为对应参数名，例如 `ParamA`。

### 参数调整

| 参数                        | 说明                               | 建议范围        |
| --------------------------- | ---------------------------------- | --------------- |
| lerp 系数（`0.15`）         | 插值速度，越大过渡越快，越小越柔和 | `0.1 ~ 0.25`    |
| 开口随机范围（`0.5 ~ 1.0`） | 控制张口幅度的下限和上限           | 按需调整        |
| 闭口随机范围（`0 ~ 0.25`）  | 保留少许开合，让"闭口"不完全静止   | `0 ~ 0.3`       |
| 切换间隔（`100 ~ 180ms`）   | 嘴巴开合的频率                     | `80ms ~ 200ms`  |
| 字符间隔（`180ms`）         | 每个字符的显示速度                 | `100ms ~ 250ms` |

## 交互演示

模型加载完成后，在下方输入框中输入任意文字并点击「发送」，模型将同步逐字展示文本并配合口型动作。

<DemoBlock demo="demoLipSync">

<<< ../demos/index.ts#demoLipSync{ts}

</DemoBlock>
