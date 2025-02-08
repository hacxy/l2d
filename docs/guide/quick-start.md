# 快速开始

## 安装

```sh
npm install l2d
```

## 加载 Live2D 模型

之后在浏览器中加载 Live2D 模型仅需两步, 假设 DOM 中存在一个 id 为 `l2d` 的 `div` 元素

### 初始化

```ts
import { init } from 'l2d';
const l2d = init(document.getElementById('l2d'));
```

调用 `init()` 方法初始化成功后, 它将返回一个实例对象用于加载模型以及调整模型样式和行为

### 加载模型

```ts
l2d.loadModel({
  path: 'https://model.hacxy.cn/HK416-1-normal/model.json',
  scale: 0.1
  // ...other options
});
```
