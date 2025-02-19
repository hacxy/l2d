---
group:
  sort: 1
  text: 简介
  icon: line-md:lightbulb-twotone
sidebar:
  icon: line-md:buy-me-a-coffee-filled
---

# 什么是l2d?

`l2d` 是 `Live2D` 的缩写. 同时也是我设法得到的足够简短的名称.
顾名思义, 它是一个应用于浏览器的 `Live2D` 模型加载工具, 你可以利用`l2d`很轻松的将 Live2D 模型加载到你的个人网站中, 这仅需几步.

通过 [stackblitz](https://stackblitz.com/edit/vitejs-vite-dye9t3?file=src%2Fmain.ts) 在线游玩`l2d`.

## 为什么开发 l2d

你也许也会存在这样的疑问, 有关Live2D的开源项目非常多, 为什么我还想去开发这个.

事实上在这个项目诞生之前, 我已经开发了另一个 Live2D 相关的项目: [oh-my-live2d](https://oml2d.hacxy.cn), 开发这个的初衷是为了解决两个令我非常头疼的问题:

- 需要通过 script 标签额外引入 cubism sdk 才可以正常加载 Live2D 模型
- 兼容问题, 无法既支持 Live2D model 2 同时还支持 Live2D model 5

当这两个问题被解决之后, 在此基础之上我还额外增加了一些交互功能, 例如: 菜单栏、加载动画、悬浮按钮、消息提示框等. 同时它也慢慢变成了一个功能基本完善并且可以在任意前端项目中使用的组件.

由于我之前的开发经验不足, 导致 `oh-my-live2d` 很多地方设计是不合理的, 核心的模型加载逻辑和组件的交互功能揉杂在了一起, 变得越来越臃肿, 难以维护, 为此我常常萌生出想要重构的想法.

最终我的想法是将模型加载能力抽离成一个独立的库, 它面向初级开发者同时也面向高级开发者, 它完全开源, 任何人都可以基于这个工具二次开发Live2D组件.

## 规划 & 进展

- [x] 打包为无生产依赖的纯js文件,无框架限制
- [x] 模型资源同步加载
- [x] 支持加载多模型
- [x] 支持设置模型位置、缩放等属性
- [x] 显示或隐藏点击区域
- [x] 模型口型动作同步
- [ ] 模型动作预加载策略
- [ ] 模型动作播放
- [ ] 获取模型动作列表
- [ ] 模型相关事件
- [ ] 画布相关操作
