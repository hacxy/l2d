# [2.0.0-beta.0](https://github.com/hacxy/l2d/compare/v2.0.0-beta...v2.0.0-beta.0) (2026-04-11)

### Bug Fixes

- 修复在vite8中报ResizeObserver loop异常 ([e047916](https://github.com/hacxy/l2d/commit/e0479162f8f8b92ac13530d76ba735625e882857))
- 修复canvas在不设置style宽高时异常放大的问题 ([4dc602a](https://github.com/hacxy/l2d/commit/4dc602a1a55a7b93327bd4ae8c78f14275efb33d))

# [2.0.0-beta](https://github.com/hacxy/l2d/compare/v1.0.1...v2.0.0-beta) (2026-04-11)

### Bug Fixes

- 调整cubism2文件加载进度 ([c8c35ff](https://github.com/hacxy/l2d/commit/c8c35ff9553bfc48b3b1b52f4688611b6951fcd3))
- 解决部分模型闲置动画无法播放的问题 ([3e342c8](https://github.com/hacxy/l2d/commit/3e342c8aa74e353516ea75f610f5b45bd8b73c89))
- 修复可点击区域计算错误的问题 ([47a704d](https://github.com/hacxy/l2d/commit/47a704d34e42d5c5d6518d17b286093e3aab5e6a))
- 修复头部跟踪计算错误和cubism2多实例显示异常的问题 ([e19ae5f](https://github.com/hacxy/l2d/commit/e19ae5f7bb1c11592dec55f9b76a9a1505e07fc6))
- 修复cubism2销毁异常 ([de6646c](https://github.com/hacxy/l2d/commit/de6646c160930b6697adc24344dc5f9a0dcccc04))
- 修复cubism6闲置动作自动播放监听不到的问题 ([8230dc1](https://github.com/hacxy/l2d/commit/8230dc11997cae7881ecd8c4142f313c778d96d6))
- 修复hit-area-overlay的层级问题，并更新文档 ([120e87e](https://github.com/hacxy/l2d/commit/120e87ec4c4b5a6f611179494f869db695008cf8))
- 修复loadstart/loadprogress事件在重复调load方法时被过滤的问题 ([3bcb1c2](https://github.com/hacxy/l2d/commit/3bcb1c2f22badd98448c28d2e30b6f7c615f708e))
- 修复tap事件异常 ([db0d77c](https://github.com/hacxy/l2d/commit/db0d77ccb89dd9db6a93e8b7c3c80908d4e40b9e))
- 移除内置的点击播放动作 ([fc445a9](https://github.com/hacxy/l2d/commit/fc445a9467c970933f4f311a38700a3b6fde028a))
- 移除内置的可点击区域可视化模块，但暴露接口，修复cubism2竞态问题 ([92786ce](https://github.com/hacxy/l2d/commit/92786cedc9e955d982fe09b0d3ebd783b272cdc8))
- 移除width、height选项，优化宽高同步逻辑 ([1cc6792](https://github.com/hacxy/l2d/commit/1cc67929867a0f37d95af792fb49dcb284010fae))
- cubism2模型scale自适应 ([af36a3b](https://github.com/hacxy/l2d/commit/af36a3bb32573edeb50ef744bf52cd0dc42d9fe8))
- getMotionFiles方法设计冗余，已移除 ([863b5a5](https://github.com/hacxy/l2d/commit/863b5a58c022a8e2297dfefc45bc9388fc8ce2cd))

### Features

- 暴露getCanvas方法 ([2af80cb](https://github.com/hacxy/l2d/commit/2af80cb91728350ba6f821a5b5eabb9e22885caa))
- 表情动作播放事件监听，修复tapEvent判定区域问题 ([c64172f](https://github.com/hacxy/l2d/commit/c64172f39091dadb50df1688daa8f52161e07d72))
- 更新首页布局和样式，删除不再使用的abeikelongbi_3模型及其相关文件 ([add5a43](https://github.com/hacxy/l2d/commit/add5a43c4653a5a5de1eacada9aa5a5456b2a969))
- 加入可点击区域，并暴露方法 ([787d71f](https://github.com/hacxy/l2d/commit/787d71f80fd8fd4da5f285d0b610ed4dfe967df4))
- 加载过程添加日志 ([1ae4069](https://github.com/hacxy/l2d/commit/1ae4069bc8ab0c655d5c582421cfa90ebf766de3))
- 模型加入事件监听 ([da5f9d1](https://github.com/hacxy/l2d/commit/da5f9d1fec3453fd4931c4001edbd33034603dc2))
- 模型可配置宽高 ([37f90aa](https://github.com/hacxy/l2d/commit/37f90aa5d4a0e0dbb68261e2a49a94f69bfcece5))
- 添加加载进度跟踪功能，更新LAppModel以支持进度回调 ([45cbad1](https://github.com/hacxy/l2d/commit/45cbad144d428dda1d28e64ded5bf4acb0d5c312))
- 添加Haru模型及其相关资源，包括物理、表情、动作和纹理文件 ([7895e58](https://github.com/hacxy/l2d/commit/7895e580a3b5fd4e923a65703fedfcca86fbda75))
- 完成cubism2和cubism5重构 ([ce039a0](https://github.com/hacxy/l2d/commit/ce039a0148f6baa9c0381a2155efd197db05a089))
- 完成scale选项的重构 ([c8b3357](https://github.com/hacxy/l2d/commit/c8b33571a396a3280529586dd020a0f8296f6110))
- 新增动作播放事件，修复pose加载顺序错误 ([7632fdf](https://github.com/hacxy/l2d/commit/7632fdfa1a55fd277fc4835c15717e63fe19c55d))
- 新增加载进度条和加载信息 ([2298fef](https://github.com/hacxy/l2d/commit/2298feffdcd0c7bf0eac623ea28cc45895a936ae))
- 新增可点击区域的hover事件 ([ae2aa6b](https://github.com/hacxy/l2d/commit/ae2aa6b6e90178c47bea771799bfb3f45b7ea20b))
- 新增destroy事件，更新文档内容 ([155a397](https://github.com/hacxy/l2d/commit/155a3977369820c9d38e54ffbcd66cdd5e850b36))
- 新增destroy销毁方法 ([33297e4](https://github.com/hacxy/l2d/commit/33297e4fdcf1861af8557cace2b899e0c54e29ef))
- 新增logLevel选项，优化日志系统 ([7e38bed](https://github.com/hacxy/l2d/commit/7e38bed96518232c8e420778b6f467ed31a7e9b7))
- 新增motionend事件，优化动作播放事件回调的参数逻辑 ([6b69324](https://github.com/hacxy/l2d/commit/6b693246811200519b6165c06b70ab03be41698f))
- 新增playMotionByFile方法与getMotionFiles方法 ([8dc9ea0](https://github.com/hacxy/l2d/commit/8dc9ea08c635003d22c1f063d9e6321ddb43a34e))
- 新增setParams接口，移除本地模型，改用远程模型 ([ed02245](https://github.com/hacxy/l2d/commit/ed02245b4dc083f021cb3b2c3768a8be17cce38d))
- 新增setPosition方法 ([8a9f3ee](https://github.com/hacxy/l2d/commit/8a9f3ee77f53859e04593b4f683fe70b09f8e010))
- 新增setScale接口 ([da94521](https://github.com/hacxy/l2d/commit/da94521a60ea437ad8b7840aeeb48b7284f5efa1))
- 新增showHitAreas选项 ([34a9971](https://github.com/hacxy/l2d/commit/34a9971b422afd4120d67926f6ff03a54a484254))
- 支持多模型实例 ([429ff81](https://github.com/hacxy/l2d/commit/429ff8103b8854e67fb3a34730e25ee9cdd47ad9))
- motionstart和motionend事件回调添加file参数值 ([0ffd0d0](https://github.com/hacxy/l2d/commit/0ffd0d06151b935c2511090b446c28073d1c248b))

## [1.0.1](https://github.com/hacxy/l2d/compare/v1.0.0...v1.0.1) (2025-11-28)

### Bug Fixes

- update eslint config and dependencies, fix type error ([6e84b46](https://github.com/hacxy/l2d/commit/6e84b46795c347f5e04658dfb17f519b8a4d1d39))
