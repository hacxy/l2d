---
sidebar:
  sort: 6
---

# 可视化点击区域

Live2D 模型内部定义了若干个**点击区域（Hit Area）**，用于响应用户在不同部位的点击交互（如点击头部、身体等）。本教程将介绍如何监听点击事件，以及如何将这些区域可视化地绘制出来——这在调试交互效果时非常实用。

> 如果你还没有完成基础初始化，请先阅读[快速开始](/guide/intro/quick-start)。

## HTML 结构

```html
<div style="position: relative; display: inline-block">
  <canvas id="l2d" style="width: 300px; height: 400px"></canvas>
</div>
```

## 监听点击事件

通过 `tap` 事件可以得知用户点击了哪个区域：

```ts
l2d.on('tap', areaName => {
  console.log('点击区域:', areaName);
});
```

`areaName` 是模型中定义的区域名称（如 `Head`、`Body`），空字符串表示点击了没有命名区域的地方。

> **注意**：Hit Area 由模型作者在 Live2D Cubism Editor 中定义，不同模型的区域名称和数量不同，部分模型可能没有定义任何 Hit Area。

## 获取区域边界

`getHitAreaBounds()` 方法返回所有 Hit Area 的边界矩形，坐标是相对于 Canvas 的**归一化值**（范围 0 ~ 1）：

```ts
await l2d.load({ path: '...' });

const bounds = l2d.getHitAreaBounds();
console.log(bounds);
// [
//   { name: 'Head', x: 0.28, y: 0.08, w: 0.44, h: 0.28 },
//   { name: 'Body', x: 0.22, y: 0.36, w: 0.56, h: 0.48 },
// ]
```

> **注意**：需要在模型加载完成（`load()` resolve 之后）才能获取到有效数据，加载前调用返回空数组。

## 可视化实现

核心思路是创建一个与 Canvas **完全重叠**的透明覆盖层 Canvas，然后在动画帧中持续绘制 Hit Area 的边界矩形。

### 完整代码

```ts
import { init } from 'l2d';

const canvas = document.getElementById('l2d') as HTMLCanvasElement;
const l2d = init(canvas);

// 创建覆盖层 canvas，绝对定位覆盖在模型上方，不拦截点击
const overlay = document.createElement('canvas');
overlay.style.cssText = 'position:fixed;top:0;left:0;pointer-events:none;z-index:9999;';
document.body.appendChild(overlay);
const ctx = overlay.getContext('2d')!;

let rafId: number | null = null;

// 监听点击事件
l2d.on('tap', areaName => {
  console.log('点击区域:', areaName);
});

l2d.load({
  path: 'https://model.hacxy.cn/shizuku/shizuku.model.json',
  scale: 0.8,
}).then(() => {
  const dpr = window.devicePixelRatio || 1;

  function draw() {
    const rect = canvas.getBoundingClientRect();
    const w = rect.width * dpr;
    const h = rect.height * dpr;

    // 同步覆盖层的位置和尺寸
    if (overlay.width !== w || overlay.height !== h) {
      overlay.width = w;
      overlay.height = h;
    }
    overlay.style.left = `${rect.left}px`;
    overlay.style.top = `${rect.top}px`;
    overlay.style.width = `${rect.width}px`;
    overlay.style.height = `${rect.height}px`;

    ctx.clearRect(0, 0, w, h);

    // 遍历所有 Hit Area，绘制边界矩形和名称标签
    for (const b of l2d.getHitAreaBounds()) {
      const x = b.x * w;
      const y = b.y * h;
      const bw = b.w * w;
      const bh = b.h * h;

      // 绿色边框
      ctx.strokeStyle = 'rgba(0,255,100,0.9)';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, bw, bh);

      // 半透明填充
      ctx.fillStyle = 'rgba(0,255,100,0.12)';
      ctx.fillRect(x, y, bw, bh);

      // 区域名称标签
      ctx.fillStyle = 'rgba(0,255,100,1)';
      ctx.font = `bold ${12 * dpr}px monospace`;
      ctx.fillText(b.name, x + 4, y + 14 * dpr);
    }

    rafId = requestAnimationFrame(draw);
  }

  draw();
});
```

### 关键点说明

- **`pointer-events:none`**：覆盖层不拦截鼠标事件，点击穿透到下方的 Canvas。
- **`devicePixelRatio`**：乘以 DPR 保证在高分屏上绘制清晰。
- **每帧重绘**：使用 `requestAnimationFrame` 保持覆盖层与模型同步（Canvas 位置变化时边框也跟随移动）。
- **归一化坐标转像素**：`b.x * w`、`b.y * h` 将 0~1 的归一化坐标还原为实际像素。

## 交互演示

点击下方「运行」按钮，模型加载完成后会看到绿色边框标注出各个可点击区域，点击区域会在右上角提示区域名称。

<DemoBlock demo="demoHitArea">

<<< ../../demos/index.ts#demoHitArea{ts}

</DemoBlock>

## 进阶：清理覆盖层

如果需要动态销毁模型或切换场景，记得同时清理覆盖层，避免残留：

```ts
// 销毁时
cancelAnimationFrame(rafId!);
overlay.remove();
l2d.destroy();
```
