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

### 初始化

```ts
import { init } from 'l2d';
const l2d = init(document.getElementById('canvas') as HTMLCanvasElement);
```

调用 `init()` 方法初始化成功后, 它将返回一个实例对象用于加载模型以及调整模型样式和行为

### 加载模型

```ts
l2d.load({
  path: 'https://model.hacxy.cn/HK416-1-normal/model.json',
  scale: 0.1
  // ...other options
}).then(() => {
  // 模型加载成功
});
```

调用加载模型方法时, 可以传入 `options` 来定义模型地址和模型样式, `load` 是一个异步函数, 你可以在 `then` 方法中监听模型是否加载成功, 为避免回调地狱, 你还可以使用 `async` 和 `await` 关键字同步调用.

```ts
import { init } from 'l2d';
const l2d = init(document.getElementById('l2d'));

async function main() {
  await l2d.load({/** ...  */});
  // ...模型加载成功之后的操作
}

main();
```
