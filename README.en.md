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

## Contributing

All kinds of contributions are welcome — bug reports, feature requests, or pull requests.

### Prerequisites

This project uses [pnpm](https://pnpm.io) to manage dependencies. Node.js **v24.14.0** is required.

```bash
# Clone the repository
git clone https://github.com/hacxy/l2d.git
cd l2d

# Install dependencies
pnpm install
```

### Workflow

1. **Open an Issue** — Before writing code, open an [Issue](https://github.com/hacxy/l2d/issues) to describe the bug or feature. This keeps everyone aligned before work begins.

2. **Create a branch** — Branch off `main` using the `<issue-id>-<github-username>` naming pattern, e.g. `42-hacxy`.

3. **Start the dev environment**:

   ```bash
   pnpm run demo:dev   # Launch the demo debug page
   ```

4. **Run tests**:

   ```bash
   pnpm run test
   ```

5. **Code style** — ESLint runs automatically on staged files via a pre-commit hook. You can also run it manually:

   ```bash
   pnpm run lint:fix
   ```

6. **Commit** — Use the built-in interactive commit tool, which guides you through writing a message that follows the [Conventional Commits](https://www.conventionalcommits.org) spec:

   ```bash
   pnpm run commit
   ```

7. **Open a Pull Request** — Target the `main` branch, describe what changed and why, and link the relevant Issue.

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
