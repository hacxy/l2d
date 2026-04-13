---
group:
  text: 教程
sidebar:
  sort: 1
---

# 概览

本节将从实际场景出发，带你逐步掌握 l2d 的核心功能。在开始之前，先了解 l2d 提供了哪些 API，以及它们能实现什么效果。

### `init(canvas)`

创建一个与 `<canvas>` 元素绑定的 L2D 实例，是使用 l2d 的第一步。

```ts
import { init } from 'l2d';

const l2d = init(document.getElementById('canvas') as HTMLCanvasElement);
```

---

### `l2d.load(options)`

加载并渲染 Live2D 模型，自动识别 Cubism 2 (`.model.json`) 和 Cubism 6 (`.model3.json`) 两种版本。`load()` 返回一个 Promise，resolved 后表示模型已渲染完成。

```ts
await l2d.load({
  path: 'https://example.com/model/model.model3.json',
  scale: 0.8,
  position: [0, -0.2],
});
```

---

### `l2d.on(event, listener)`

监听模型生命周期事件，可以在任意时机绑定。

| 事件              | 回调参数                         | 说明                         |
| ----------------- | -------------------------------- | ---------------------------- |
| `loadstart`       | `(total: number)`                | 开始加载，`total` 为文件总数 |
| `loadprogress`    | `(loaded, total, file)`          | 每个文件加载完毕时触发       |
| `loaded`          | `()`                             | 模型全部加载完成，开始渲染   |
| `tap`             | `(areaName: string)`             | 用户点击了 Hit Area          |
| `motionstart`     | `(group, index, duration, file)` | 动作开始播放                 |
| `motionend`       | `(group, index, file)`           | 动作播放结束                 |
| `expressionstart` | `(id: string)`                   | 表情切换开始                 |
| `expressionend`   | `()`                             | 表情切换结束                 |
| `destroy`         | `()`                             | 模型销毁完成                 |

---

### `l2d.setParams(params)`

批量设置模型参数，可精细控制模型的姿态（眼睛开合、嘴巴形状、头部角度等）。参数 ID 因模型而异：Cubism 2 可在 `.mtn` 动作文件中查找，Cubism 6 可在 `.motion3.json` 动作文件中查找。

```ts
// Cubism 2 参数示例（以 shizuku 模型为例）
l2d.setParams({
  PARAM_MOUTH_OPEN_Y: 1, // 嘴巴张开（0 关闭，1 全开）
  PARAM_EYE_L_OPEN: 0, // 左眼闭合
  PARAM_ANGLE_X: 15, // 头部向右偏转
});

// Cubism 6 参数示例（以 Mao 模型为例）
l2d.setParams({
  ParamA: 1, // 嘴巴张开
  ParamEyeLOpen: 0, // 左眼闭合
  ParamAngleX: 15,
});
```

---

### `l2d.getHitAreaBounds()`

获取模型所有 Hit Area 的边界矩形，返回归一化坐标（相对于 Canvas 的 0~1 范围）。适合用于可视化调试或自定义点击判断逻辑。

```ts
const bounds = l2d.getHitAreaBounds();
// [{ name: 'Head', x: 0.3, y: 0.1, w: 0.4, h: 0.3 }, ...]
```

---

### `l2d.getMotions()` / `l2d.playMotion(group, index?, priority?)`

获取模型所有可用动作并按分组播放。

```ts
const motions = l2d.getMotions();
// { Idle: ['idle1.motion3.json'], Tap: ['tap_body.motion3.json'] }

l2d.playMotion('Tap'); // 随机播放 Tap 组中的动作
l2d.playMotion('Idle', 0); // 播放 Idle 组第 0 个动作
```

---

### `l2d.getExpressions()` / `l2d.setExpression(id?)`

获取模型所有可用表情并切换。

```ts
const expressions = l2d.getExpressions();
// ['f01', 'f02', 'f03']

l2d.setExpression('f01'); // 切换到指定表情
l2d.setExpression(); // 随机切换表情
```

---

### `l2d.setScale(scale)` / `l2d.setPosition(x, y)`

动态调整模型的缩放和位置，无需重新加载模型。

```ts
l2d.setScale(1.2);
l2d.setPosition(0.2, -0.3);
```

---

### `l2d.destroy()`

释放所有 WebGL 资源并清空 Canvas，触发 `destroy` 事件。销毁后可以在同一实例上再次调用 `load()` 来加载新模型。

---

## 能实现什么？

以下是一些常见的使用场景：

| 场景                     | 用到的 API                                   |
| ------------------------ | -------------------------------------------- |
| 将模型嵌入网页展示       | `init` + `load`                              |
| 显示自定义加载进度条     | `on('loadstart')` + `on('loadprogress')`     |
| 点击模型触发互动         | `on('tap')` + `playMotion` / `setExpression` |
| 可视化调试点击区域       | `getHitAreaBounds()`                         |
| 程序化控制口型/眼睛      | `setParams`                                  |
| 口型同步（逐字显示文本） | `setParams` + `setTimeout`                   |
| 在同一页面展示多个模型   | 多次调用 `init`，各绑定不同 canvas           |
| 动态切换模型             | `destroy()` + `load()`                       |
