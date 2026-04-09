export interface Options {
  /** 模型配置文件路径（`.model.json` 或 `.model3.json`） */
  path: string
  /**
   * 模型位置偏移 `[x, y]`，`x` 正值右移，`y` 正值上移
   * @example [0.5, -0.2]
   */
  position?: [x: number, y: number]
  /**
   * 模型缩放比例，`1` 为原始大小
   * @example 0.5
   */
  scale?: number
}

export interface L2DEventMap {
  /** 点击命中 hit area 时触发，`areaName` 为命中的区域名称 */
  tap: (areaName: string) => void
  /** 开始加载，`total` 为需要加载的文件总数 */
  loadstart: (total: number) => void
  /** 单个文件加载完成 */
  loadprogress: (loaded: number, total: number, file: string) => void
  /** 所有资源就绪，模型开始渲染 */
  loaded: () => void
  /** 表情开始播放，`id` 为表情 ID */
  expressionstart: (id: string) => void
  /** 表情播放结束 */
  expressionend: () => void
  /** 动作开始播放，`group` 为动作组名，`index` 为动作索引，`file` 为动作文件名 */
  motionstart: (group: string, index: number | undefined, duration: number | null, file: string | null) => void
  /** 动作播放结束，`group` 为动作组名，`index` 为动作索引，`file` 为动作文件名 */
  motionend: (group: string, index: number | undefined, file: string | null) => void
}
