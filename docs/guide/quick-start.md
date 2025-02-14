---
sidebar:
  sort: 1
---

# 快速开始

## 安装

```sh
npm install l2d@next
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

在画布中创建和加载一个模型, 只需要调用`l2d`实例下的 `create` 方法, 调用时可以传入 [options](./create-options.md) 来定义模型地址和模型样式, 同时 `create` 是一个异步函数, 你可以在 `then` 方法被调用时表示模型创建成功.

<<< ../demos/index.ts#demo1

如果模型成功被创建, 那么在画布中应该能看到这个 Live2D 模型:

<Demo :demo="demo1" />

#### 同步调用

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

另外, 在创建模型时可以传递 **[创建选项](./create-options.md)** 来定义模型的行为和样式.

#### 在当前画布上创建多个模型

`create` 方法支持调用多次, 这将会在画布上创建多个模型:

:::tabs
== 代码示例

<<< ../demos/index.ts#demo2

== 效果

<Demo :demo="demo2" :width="450"/>

:::

<script setup>
import { demo1, demo2 } from '../demos/index.ts'
</script>
