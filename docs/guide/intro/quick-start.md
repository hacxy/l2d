---
sidebar:
  sort: 2
---

# 快速开始

## 安装

```sh
npm install l2d
```

## 基础用法

之后在浏览器中加载 Live2D 模型仅需两步, 假设 DOM 中存在一个 id 为 `l2d` 的 `canvas` 元素

```html
<canvas id="l2d"></canvas>
```

### 初始化画布

```ts
import { init } from 'l2d';
const l2d = init(document.getElementById('l2d') as HTMLCanvasElement);
```

调用 `init()` 方法初始化成功后, 它将返回一个l2d实例对象, 用于加载或调整模型状态.

### 加载模型

在画布中创建和加载一个模型, 只需要调用`l2d`实例下的 `load` 方法, 调用时可以传入 [options](../model/index.md) 来定义模型地址和模型样式, 同时 `load` 是一个异步函数, 当 `then` 方法被调用时表示模型创建成功.

<DemoBlock demo="demo1">

<<< ../../demos/index.ts#demo1{ts}

</DemoBlock>