export interface LoadingOverlayOptions {
  /** 蒙层背景色，支持任意 CSS 颜色值 @default 'rgba(0,0,0,0.55)' */
  background?: string
  /** 进度条轨道（未填充部分）颜色 @default 'rgba(255,255,255,0.15)' */
  trackColor?: string
  /** 进度条填充颜色 @default 'rgba(255,255,255,0.85)' */
  barColor?: string
  /** 文字颜色 @default 'rgba(255,255,255,0.9)' */
  textColor?: string
}

export interface Options {
  /** 模型配置文件路径（`.model.json` 或 `.model3.json`） */
  path: string
  /**
   * 模型在画布中的位置偏移，`[x, y]` 均为逻辑坐标
   * @example [0.5, -0.2]
   */
  position?: [x: number, y: number]
  /**
   * 模型缩放比例，`1` 为原始大小，`'auto'` 根据画布宽高自动缩放确保模型完整显示
   * @default 'auto'
   * @example 1.5
   */
  scale?: number | 'auto'
  /**
   * 模型旋转角度（度），正值为顺时针
   * @default 0
   * @example 15
   */
  rotation?: number
  /**
   * 加载进度条配置，`true` 使用默认样式，`false` 关闭，传入对象可自定义样式
   * @default true
   */
  loading?: boolean | LoadingOverlayOptions
}

export interface L2DEventMap {
  /** 所有资源就绪，模型开始渲染 */
  loaded: () => void
  /** `.moc3` / `.moc` 模型文件加载完成，模型骨架就绪（纹理尚未加载） */
  modelfileloaded: () => void
  /** 所有纹理绑定完成，模型首次可见 */
  texturesloaded: () => void
  /** 点击命中 hit area 时触发，`areaName` 为命中的区域名称 */
  tap: (areaName: string) => void
  /** 鼠标悬停在 hit area 上时触发，`areaName` 为命中的区域名称 */
  hover: (areaName: string) => void
}
