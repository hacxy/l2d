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
顾名思义, 它是一个应用于浏览器的 `Live2D` 模型加载工具, 利用`l2d` 仅需几步就可以将 Live2D 模型加载到你的个人网站中.

通过 [stackblitz](https://stackblitz.com/edit/vitejs-vite-dye9t3?file=src%2Fmain.ts) 在线游玩`l2d`.

## 为什么开发 l2d

事实上在开源社区能够找到的Live2D相关库非常多, 但用起来都不尽人意, 我希望能够使用足够现代化的方式在我的个人网站加入一个Live2D模型, 为此我不得不自己动手.

## 规划 & 进展

- [x] 打包为无生产依赖的纯js文件,无框架限制
- [x] 模型资源同步加载
- [x] 支持加载多模型
- [x] 支持设置模型位置、缩放等属性
- [x] 显示或隐藏点击区域
- [x] 模型口型动作同步
- [x] 播放模型表情
- [x] 模型动作预加载策略
- [x] 模型动作播放
- [x] 获取模型动作列表
- [x] 模型相关事件
