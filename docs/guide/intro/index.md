---
group:
  sort: 1
  text: 简介
---

# 什么是 l2d

`l2d` 是一个面向浏览器的 Live2D 模型加载库，完全基于 Live2D 官方 Cubism SDK 进行二次封装。`l2d` 同时也是 `Live2D` 的简写，寓意着用更简单、更快捷、更低成本的方式在 Web 页面中加载 Live2D 模型。

## 为什么选择 l2d

- **开箱即用** — 无需手动引入 SDK，传入模型路径即可加载，自动识别版本
- **全版本兼容** — 内置 Cubism 2 & 6 运行时，同时支持 `.model.json`（Cubism 2）和 `.model3.json`（Cubism 6），覆盖所有Live2D模型版本
- **丰富的交互能力** — 支持播放动作、切换表情、点击区域检测，提供完整的加载与交互事件回调，未来将尽可能的提供更丰富的API
- **零依赖，轻量** — 单一 JS 文件，不绑定任何框架，Vue、React、原生项目均可直接使用

## 免责声明

::: warning 关于 Live2D 模型版权
Live2D 模型及其相关资源（贴图、动作、表情文件等）的著作权归原始权利人所有。`l2d` 仅提供技术加载能力，**不包含、不分发任何模型资源**。

在使用 `l2d` 加载任何 Live2D 模型时，请确保：

1. 你拥有该模型的使用权或已获得权利人的明确授权
2. 你的使用行为符合模型附带的许可协议（如禁止商用、禁止二次分发等）
3. 不得将本库用于侵权、违法或违反 Live2D Inc. 服务条款的用途

对于因不当使用模型资源而产生的任何版权纠纷或法律责任，`l2d` 及其贡献者不承担任何责任。
:::

::: info 关于 Cubism SDK
`l2d` 在运行时集成了 Live2D Cubism SDK。Cubism SDK 的使用须遵守 [Live2D Proprietary Software License](https://www.live2d.com/eula/live2d-proprietary-software-license-agreement_en.html)。若你的项目用于商业用途，请自行确认是否需要向 Live2D Inc. 申请商业许可。
:::
