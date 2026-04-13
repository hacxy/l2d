---
# https://vitepress.dev/reference/default-theme-home-page
layout: home
markdownStyles: false

hero:
  name: "L2D"
  text: "为浏览器而生的 Live2D 加载库"
  tagline: 零依赖 · 全版本兼容 · 开箱即用
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/intro/quick-start.md
    - theme: alt
      text: 什么是 l2d？
      link: /guide/intro/index.md
    - theme: alt
      text: Demos
      link: https://l2d-demo.hacxy.cn

features:
  - title: 开箱即用
    details: 无需手动引入 SDK，传入模型路径即可加载，自动识别版本
  - title: 全版本兼容
    details: 内置 Cubism 2 & 6 运行时，覆盖所有Live2D模型版本
  - title: 丰富的交互能力
    details: 支持播放动作、切换表情、点击区域检测，提供完整的加载与交互事件回调
  - title: 零依赖，轻量
    details: 单一 JS 文件，不绑定任何框架，Vue、React、原生项目均可直接使用
---
