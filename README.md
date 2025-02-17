<p align="center">
  <img width="240"  src="https://hacxy-1259720482.cos.ap-hongkong.myqcloud.com/images/logo.svg"/>
</p>
<h1 align="center">L2D</h1>
<h4 align="center">在浏览器中加载 Live2D 模型更简单</h4>

[![npm](https://img.shields.io/npm/v/l2d?color=FFB6C1&labelColor=1b1b1f&label=npm)](https://www.npmjs.com/package/l2d)
[![downloads](https://img.shields.io/npm/dm/l2d?color=FFB6C1&labelColor=1b1b1f&label=downloads)](https://www.npmjs.com/package/l2d)

## 什么是 l2d

`l2d` 是 `Live2D` 的缩写. 同时也是我设法得到的足够简短的名称.
顾名思义, 它是一个应用于浏览器的 `Live2D` 模型加载工具, 你可以利用`l2d`很轻松的将 Live2D 模型加载到你的个人网站中, 这仅需几步.

通过 [stackblitz](https://stackblitz.com/edit/vitejs-vite-dye9t3?file=src%2Fmain.ts) 在线游玩`l2d`.

- 无框架限制, 在任意框架或原生项目中都可使用
- 默认集成Cubism2以及Cubism5, 无生产环境依赖且无需额外引入Cubism SDK
- 支持所有版本Live2D模型
- 支持口型动作同步

## 为什么开发 l2d

你也许也会存在这样的疑问, 有关 Live2D 的开源项目非常多, 为什么我还想去开发这个.

事实上在这个项目诞生之前, 我已经开发了另一个 Live2D 相关的项目: [oh-my-live2d](https://oml2d.hacxy.cn), 开发这个的初衷是为了解决两个令我非常头疼的问题:

- 需要通过 script 标签额外引入 cubism sdk 才可以正常加载 Live2D 模型
- 兼容问题, 无法既支持 Live2D model 2 同时还支持 Live2D model 5

当这两个问题被解决之后, 在此基础之上我还额外增加了一些交互功能, 例如: 菜单栏、加载动画、悬浮按钮、消息提示框等, 目的是为了完成一个完整的看板组件, 但实际上这些额外的功能都不是必须的.

由于我之前的开发经验不足, 导致 `oh-my-live2d` 很多地方设计是不合理的, 核心的模型加载逻辑和组件的交互功能揉杂在了一起, 变得越来越臃肿, 难以维护, 为此我常常萌生出想要重构的想法.

最终我的想法是将模型加载能力抽离成一个独立的库, 它面向初级开发者同时也面向高级开发者, 它完全开源, 任何人都可以基于这个工具二次开发Live2D组件.

## 案例

以下是目前正在使用`l2d`的项目:

- https://github.com/LeafYeeXYZ/DigitalLife

## 贡献者们

感谢以下所有为 `oh-my-live2d` 贡献过代码的 [开发者们](https://github.com/hacxy/l2d/graphs/contributors)。

<a href="https://github.com/hacxy/l2d/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=hacxy/l2d" />
</a>

## License

[MIT](./LICENSE) License &copy; 2023-PRESENT [Hacxy](https://github.com/hacxy)
