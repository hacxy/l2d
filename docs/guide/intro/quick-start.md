---
sidebar:
  sort: 3
---

# 快速开始

## 安装 l2d

::: code-group

```sh [pnpm]
pnpm add l2d
```

```sh [npm]
npm install l2d
```

```sh [yarn]
yarn add l2d
```

:::

如果你的项目不使用构建工具，也可以通过 CDN 直接引入：

```html
<script src="https://unpkg.com/l2d/dist/index.min.js"></script>
```

## 创建画布

Live2D 模型渲染在 `<canvas>` 元素上。准备一个 canvas，并**通过 CSS** 设置它的显示尺寸：

```html
<canvas id="canvas" style="width: 300px; height: 400px;"></canvas>
```


## 加载模型

```ts
import { init } from "l2d";

// 1. 获取 canvas 元素
const canvas = document.getElementById("canvas") as HTMLCanvasElement;

// 2. 创建 L2D 实例
const l2d = init(canvas);

// 3. 加载模型（传入上一章介绍的入口文件路径）
l2d.load({
  path: "https://model.hacxy.cn/Haru/Haru.model3.json",
});
```

这三步就完成了一个模型的加载：`init()` 将实例绑定到 canvas，`load()` 负责下载资源并开始渲染。

## 等待加载完成

模型资源需要通过网络下载，加载是异步的。如果你需要在加载完成后执行某些操作，可以监听 `loaded` 事件：

```ts
// 方式一：事件监听（监听器必须在 load() 之前注册）
l2d.on("loaded", () => {
  console.log("模型加载完成！");
});

l2d.load({
  path: "https://model.hacxy.cn/Haru/Haru.model3.json",
});
```

```ts
// 方式二：async/await
await l2d.load({
  path: "https://model.hacxy.cn/Haru/Haru.model3.json",
});
console.log("模型加载完成！");
```

> 使用事件监听方式时，请确保在调用 `l2d.load()` 之前完成注册，否则可能错过事件。

## 显示加载进度

对于资源较多的模型，可以监听 `loadstart` 和 `loadprogress` 事件展示加载进度：

```ts
l2d.on("loadstart", (total) => {
  console.log(`共需加载 ${total} 个文件`);
});

l2d.on("loadprogress", (loaded, total, file) => {
  const percent = Math.round((loaded / total) * 100);
  console.log(`${percent}% — ${file}`);
});
```

## CDN完整示例

以下是一个不依赖构建工具、可以直接在浏览器运行的完整示例：

```html
<!DOCTYPE html>
<html>
  <body>
    <canvas id="canvas" style="width: 300px; height: 400px;"></canvas>

    <script type="module">
      import { init } from "https://unpkg.com/l2d/dist/index.min.js";

      const canvas = document.getElementById("canvas");
      const l2d = init(canvas);

      l2d.on("loadprogress", (loaded, total) => {
        console.log(`加载中 ${loaded}/${total}`);
      });

      l2d.on("loaded", () => {
        console.log("加载完成");
      });

      l2d.load({
        path: "https://model.hacxy.cn/Haru/Haru.model3.json",
      });
    </script>
  </body>
</html>
```
