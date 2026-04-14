---
sidebar:
  sort: 2
---

# 快速开始

要使用 `l2d` 将Live2D模型加载到浏览器中仅需以下三步

## 安装

::: code-group

```sh [npm]
npm install l2d
```

```html [CDN]
<script src="https://unpkg.com/l2d/dist/index.min.js"></script>
```

:::


之后在浏览器中加载 Live2D 模型仅需两步, 假设 DOM 中存在一个 id 为 `l2d` 的 `canvas` 元素

```html
<canvas id="l2d"></canvas>
```

## 初始化画布

::: code-group

```ts [npm]
import { init } from 'l2d';
const l2d = init(document.getElementById('l2d') as HTMLCanvasElement);
```

```html [CDN]
<script src="https://unpkg.com/l2d/dist/index.min.js"></script>
<script>
  const l2d = L2D.init(document.getElementById('l2d'));
</script>
```

:::

调用 `init()` 方法初始化成功后, 它将返回一个l2d实例对象, 用于加载或调整模型状态.

## 加载模型

在画布中创建和加载一个模型, 只需要调用`l2d`实例下的 `load` 方法, 调用时可以传入 [options](../model/index.md) 来定义模型地址和模型样式, 同时 `load` 是一个异步函数, 当 `then` 方法被调用时表示模型创建成功，相反当catch被调用时，说明模型文件加载失败，需检查path属性传入的地址能否通过网络正常访问

<DemoBlock demo="demo1">

<<< ../../demos/index.ts#demo1{ts}

</DemoBlock>

- CDN方式请参考以下完整代码案例

:::details CDN完整案例
``` html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <script src="https://unpkg.com/l2d/dist/index.min.js"></script>
  </head>
  <body>
    <div style="display: flex">
      <canvas id="l2d" style="width: 300px; height: 300px;"></canvas>
    </div>
    <script>
      const l2d = L2D.init(document.getElementById('l2d'))
      l2d
        .load({
          path: 'https://model.hacxy.cn/cat-black/model.json',
        })
        .then(() => {
          console.log('加载成功')
        })
    </script>
  </body>
</html>
```
:::
