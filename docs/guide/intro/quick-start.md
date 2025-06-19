---
sidebar:
  icon: line-md:coffee-loop
  sort: 2
---

# 快速开始

## 安装

```sh
npm install l2d
```

## 基础用法

之后在浏览器中加载 Live2D 模型仅需两步, 假设 DOM 中存在一个 id 为 `l2d-canvas` 的 `canvas` 元素

```html
<canvas id="l2d-canvas"></canvas>
```

### 初始化画布

```ts
import { init } from 'l2d';
const l2d = init(document.getElementById('canvas') as HTMLCanvasElement);
```

调用 `init()` 方法初始化成功后, 它将返回一个画布实例对象, 用于加载模型, 以及画布相关操作.

### 创建模型

在画布中创建和加载一个模型, 只需要调用`l2d`实例下的 `create` 方法, 调用时可以传入 [options](../model/index.md) 来定义模型地址和模型样式, 同时 `create` 是一个异步函数, 当 `then` 方法被调用时表示模型创建成功.

<<< ../../demos/index.ts#demo1

点击下方运行按钮, 如果模型成功被创建, 那么在画布中应该能看到这个 Live2D 模型:

<DemoModal :demo="demo1" />

创建模型时可以传递 **[创建选项](../model/index.md)** 来定义模型的行为和样式.

#### 同步调用

使用 `async` 和 `await` 关键字同步调用该方法时, 能避免回调地狱, 同时也可以在模型创建成功后执行模型相关操作:

```ts
import { init } from 'l2d';
const l2d = init(document.getElementById('l2d'));

async function main() {
  const model = await l2d.create({
    /** ...options  */
  });
  console.log('模型加载成功');
  // ...模型加载成功之后的操作
  model.setVolume(0);
}

main();
```

除此之外, 你还可以使用`createSync` 方法进行同步调用, 该方法可以更准确的监听模型的每一步加载过程:

<<< ../../demos/index.ts#demoSync

<DemoModal :demo="demoSync"/>

- `settingsJSONLoaded`: Settings json文件加载完成
- `settingsLoaded`: 设置加载完成
- `modelLoaded`: 模型加载完成
- `ready`: 模型资源全部加载完毕

事件调用顺序: settingsJSONLoaded -> settingsLoaded -> modelLoaded -> textureLoaded -> ready

> [!WARNING]
> 使用 `create` 方法创建模型时, 会跳过一部分加载过程的事件回调函数.

以下是使用 `create` 方法时对加载过程进行事件监听的示例:

<<< ../../demos/index.ts#demo5

<DemoModal :demo="demo5"/>

<!-- 以下是不同方法加载模型过程事件是否被执行的对比情况: -->



## 创建多个模型

`create` 方法支持调用多次, 这将会在同一画布上创建多个模型:

::: tip
在这个示例中, 当黑猫创建完成后才会开始创建白猫
:::

<<< ../../demos/index.ts#demo2

<DemoModal :demo="demo2" width="100%"/>

还可以同时使用 `create` 和 `createSync`:

<<< ../../demos/index.ts#demo6

<DemoModal :demo="demo6"/>

## 常见问题
- 在同一页面中, 使用多个canvas加载模型时会导致 WebGL Context 冲突, 无法在多个canvas中同时加载多个 model3.json, 这意味着使用 model3 及以上时, `init` 方法在同一页面只允许调用一次.


<script setup>
import { demo1, demo2, demoSync, demo5, demo6 } from '../../demos/index.ts'
</script>