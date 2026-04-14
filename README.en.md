<p align="center">
  <img width="240"  src="https://hacxy-1259720482.cos.ap-hongkong.myqcloud.com/images/logo.svg"/>
</p>
<h1 align="center">L2D</h1>
<h4 align="center">Load Live2D models in the browser, more easily</h4>

[简体中文](./README.md) · English

[![npm](https://img.shields.io/npm/v/l2d?color=FFB6C1&labelColor=1b1b1f&label=npm)](https://www.npmjs.com/package/l2d)
[![downloads](https://img.shields.io/npm/dm/l2d?color=FFB6C1&labelColor=1b1b1f&label=downloads)](https://www.npmjs.com/package/l2d)

## What is l2d

`l2d` is a JavaScript library for driving Live2D models in the browser. It is built entirely on top of the official Live2D Cubism SDK. The name `l2d` is also shorthand for **Live2D**, reflecting a simpler, faster, lower-friction way to load Live2D models on the web.

- **Ready to use** — No need to wire up the official SDK by hand; load a Live2D model in three steps
- **Broad version support** — Ships with Cubism 2 & 6 runtimes, supports both `.model.json` (Cubism 2) and `.model3.json` (Cubism 6), covers all common Live2D model versions, and exposes a single, consistent API surface
- **One API for both** — Models driven by Cubism 2 and 6 share the same API design, keeping capabilities and conventions as aligned as possible across versions
- **Zero dependencies, lightweight** — One JS bundle, no framework lock-in; use it in Vue, React, or vanilla projects

[Documentation](https://l2d.hacxy.cn)

L2D Demos: <https://l2d-demo.hacxy.cn>

Online preview & debug tool: <https://l2d-viewer.hacxy.cn>

Try `l2d` on [StackBlitz](https://stackblitz.com/edit/vitejs-vite-dye9t3?file=src%2Fmain.ts).

## Contributors

Thanks to everyone who has contributed code to `l2d` — see [contributors](https://github.com/hacxy/l2d/graphs/contributors).

<a href="https://github.com/hacxy/l2d/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=hacxy/l2d" />
</a>

## Discussion

WeChat group:

<img width="200"  src="https://raw.githubusercontent.com/hacxy/hacxy/main/images/wxq.jpg"/>

## Disclaimer

Copyright in Live2D models and related assets (textures, motions, expression files, etc.) belongs to the respective rights holders. `l2d` only provides technical loading capabilities and **does not include or redistribute any model assets**.

When using `l2d` to load any Live2D model, make sure that:

1. You have the right to use the model or explicit authorization from the rights holder
2. Your use complies with the model’s license terms (e.g. no commercial use, no redistribution)
3. You do not use this library for infringement, unlawful activity, or anything that violates Live2D Inc.’s terms of service

`l2d` and its contributors are not liable for copyright disputes or legal consequences arising from misuse of model assets.

At runtime, `l2d` integrates the Live2D Cubism SDK. Use of the Cubism SDK is subject to the [Live2D Proprietary Software License](https://www.live2d.com/eula/live2d-proprietary-software-license-agreement_en.html). If your project is commercial, confirm whether you need a commercial license from Live2D Inc.

## License

[MIT](./LICENSE) License &copy; 2023-PRESENT [Hacxy](https://github.com/hacxy)
