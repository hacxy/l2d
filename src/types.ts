export interface Options {
  /** 模型配置文件路径（`.model.json` 或 `.model3.json`） */
  path: string
  /**
   * 模型在画布中的位置偏移，`[x, y]` 均为逻辑坐标
   * @example [0.5, -0.2]
   */
  position?: [x: number, y: number]
  /**
   * 模型缩放比例，`1` 为原始大小
   * @example 1.5
   */
  scale?: number
  /**
   * 画布宽度（像素），未指定时默认 `300`
   * @default 300
   */
  width?: number
  /**
   * 画布高度（像素），未指定时默认 `300`
   * @default 300
   */
  height?: number
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
  /** `.moc3` / `.moc` 模型文件加载完成，模型骨架就绪（纹理尚未加载） */
  modelfileloaded: () => void
  /** 所有纹理绑定完成，模型首次可见 */
  texturesloaded: () => void
  /** 点击命中 hit area 时触发，`areaName` 为命中的区域名称 */
  tap: (areaName: string) => void
  /** 鼠标悬停在 hit area 上时触发，`areaName` 为命中的区域名称 */
  hover: (areaName: string) => void
}
