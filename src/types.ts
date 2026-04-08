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
  /** 开始加载，`total` 为需要加载的文件总数 */
  loadstart: (total: number) => void
  /** 单个文件加载完成 */
  loadprogress: (loaded: number, total: number, file: string) => void
  /** 所有资源就绪，模型开始渲染 */
  loaded: () => void
  /** 点击命中 hit area 时触发，`areaName` 为命中的区域名称 */
  tap: (areaName: string) => void
  /** 表情开始播放，`id` 为表情 ID */
  expressionstart: (id: string) => void
  /** 表情播放结束 */
  expressionend: () => void
  /** 动作开始播放，`group` 为动作组名，`index` 为动作索引 */
  motionstart: (group: string, index: number | undefined, duration: number | null) => void
  /** 动作播放结束，`group` 为动作组名，`index` 为动作索引 */
  motionend: (group: string, index: number | undefined) => void
}
