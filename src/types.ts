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
}

export interface L2DEventMap {
  /** 所有资源就绪，模型开始渲染 */
  loaded: () => void
  /** 开始加载，`total` 为需要加载的文件总数 */
  loadstart: (total: number) => void
  /** 单个文件加载完成 */
  loadprogress: (loaded: number, total: number, file: string) => void
  /** `.moc3` / `.moc` 模型文件加载完成，模型骨架就绪（纹理尚未加载） */
  modelfileloaded: () => void
  /** 所有纹理绑定完成，模型首次可见 */
  texturesloaded: () => void
  /** 点击命中 hit area 时触发，`areaName` 为命中的区域名称 */
  tap: (areaName: string) => void
  /** 鼠标悬停在 hit area 上时触发，`areaName` 为命中的区域名称 */
  hover: (areaName: string) => void
}
