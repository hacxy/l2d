<p align="center">
  <img width="240"  src="https://hacxy-1259720482.cos.ap-hongkong.myqcloud.com/images/logo.svg"/>
</p>
<h1 align="center">L2D</h1>
<h4 align="center">在浏览器中加载 Live2D 模型更简单</h4>

简体中文 · [English](./README.en.md)

[![npm](https://img.shields.io/npm/v/l2d?color=FFB6C1&labelColor=1b1b1f&label=npm)](https://www.npmjs.com/package/l2d)
[![downloads](https://img.shields.io/npm/dm/l2d?color=FFB6C1&labelColor=1b1b1f&label=downloads)](https://www.npmjs.com/package/l2d)

## 什么是 l2d

`l2d` 是一个用于在浏览器驱动 Live2D 模型的javascript库，完全基于 Live2D 官方 Cubism SDK 进行二次封装。`l2d` 同时也是 `Live2D` 的简写，寓意着用更简单、更快捷、更低成本的方式在 Web 页面中加载 Live2D 模型。

- **开箱即用** — 无需手动引入官方 SDK，三步完成Live2D模型加载
- **全版本兼容** — 内置 Cubism 2 & 6 运行时，同时支持 `.model.json`（Cubism 2）和 `.model3.json`（Cubism 6），覆盖所有Live2D模型版本，并暴露规范统一的接口
- **统一规范的API** Cubism 2 & 6 所驱动的模型均使用完全相同规范的接口，尽可能保证两版本的能力与规范完全对称
- **零依赖，轻量** — 单一 JS 文件，不绑定任何框架，Vue、React、原生项目均可直接使用

[查阅文档](https://l2d.hacxy.cn)

通过 [stackblitz](https://stackblitz.com/edit/vitejs-vite-dye9t3?file=src%2Fmain.ts) 在线游玩`l2d`.

## 贡献者们

感谢以下所有为 `l2d` 贡献过代码的 [开发者们](https://github.com/hacxy/l2d/graphs/contributors)。

<a href="https://github.com/hacxy/l2d/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=hacxy/l2d" />
</a>

## 讨论

微信群:

<img width="200"  src="https://raw.githubusercontent.com/hacxy/hacxy/main/images/20250217175953.png"/>

## 免责声明

Live2D 模型及其相关资源（贴图、动作、表情文件等）的著作权归原始权利人所有。`l2d` 仅提供技术加载能力，**不包含、不分发任何模型资源**。

在使用 `l2d` 加载任何 Live2D 模型时，请确保：

1. 你拥有该模型的使用权或已获得权利人的明确授权
2. 你的使用行为符合模型附带的许可协议（如禁止商用、禁止二次分发等）
3. 不得将本库用于侵权、违法或违反 Live2D Inc. 服务条款的用途

对于因不当使用模型资源而产生的任何版权纠纷或法律责任，`l2d` 及其贡献者不承担任何责任。

`l2d` 在运行时集成了 Live2D Cubism SDK。Cubism SDK 的使用须遵守 [Live2D Proprietary Software License](https://www.live2d.com/eula/live2d-proprietary-software-license-agreement_en.html)。若你的项目用于商业用途，请自行确认是否需要向 Live2D Inc. 申请商业许可。

## License

[MIT](./LICENSE) License &copy; 2023-PRESENT [Hacxy](https://github.com/hacxy)
