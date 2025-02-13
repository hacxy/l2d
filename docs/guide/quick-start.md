---
sidebar:
  sort: 1
---

# 快速开始

## 安装

```sh
npm install l2d@next
```

## 加载 Live2D 模型

之后在浏览器中加载 Live2D 模型仅需两步, 假设 DOM 中存在一个 id 为 `l2d-canvas` 的 `canvas` 元素

```html
<canvas id="l2d-canvas"></canvas>
```

### 初始化画布

```ts
import { init } from 'l2d';
const l2d = init(document.getElementById('canvas') as HTMLCanvasElement);
```

调用 `init()` 方法初始化成功后, 它将返回一个实例对象用于加载模型以及调整模型样式和行为

### 创建模型

在画布中创建和加载一个模型, 只需要调用`l2d`实例下的 `create` 方法, 调用时可以传入 `options` 来定义模型地址和模型样式, 同时 `create` 是一个异步函数, 你可以在 `then` 方法被调用时表示模型创建成功.

```ts
l2d.create({
  path: 'https://model.hacxy.cn/HK416-1-normal/model.json',
  // ...other options
}).then(() => {
  // 模型创建成功
});
```

如果模型成功被创建, 那么在画布中你应该能看到这个 Live2D 模型:

<Live2D path="https://model.hacxy.cn/HK416-1-normal/model.json" :width="200" :height="240"/>

为了避免回调地狱, 你还可以使用 `async` 和 `await` 关键字同步调用:

```ts
import { init } from 'l2d';
const l2d = init(document.getElementById('l2d'));

async function main() {
  await l2d.create({/** ...options  */});
  // ...模型加载成功之后的操作
}

main();
```
