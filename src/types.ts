export interface ParamInfo {
  /** 参数 ID */
  id: string
  /** 当前值 */
  value: number
  /** 最小值 */
  min: number
  /** 最大值 */
  max: number
  /** 默认值 */
  default: number
}

export interface Options {
  /** 模型配置文件路径（`.model.json` 或 `.model3.json`） */
  path: string
  /**
   * 模型位置偏移 `[x, y]`，`x` 正值右移，`y` 正值上移，范围通常为 `-2 ~ 2`
   * @example [0.5, -0.2]
   */
  position?: [x: number, y: number]
  /**
   * 模型缩放比例，`1` 为原始大小
   * @example 0.5
   */
  scale?: number
  /**
   * 日志输出级别，默认 `'warn'`。设为 `'trace'` 可查看详细加载日志，设为 `'error'` 可屏蔽警告。
   */
  logLevel?: 'error' | 'warn' | 'info' | 'trace'
  /**
   * 动作声音文件的播放音量，范围 `0`（静音）~ `1`（最大），默认 `0`。
   */
  volume?: number
}

export interface L2DEventMap {
  /**
   * 用户点击 canvas 且命中 hit area 时触发，`areaName` 为命中的区域名称
   */
  tap: (areaName: string) => void
  /**
   * 调用 `load()` 后，模型文件开始下载前触发，`total` 为需要加载的文件总数
   */
  loadstart: (total: number) => void
  /**
   * 每个文件下载完成时触发
   */
  loadprogress: (loaded: number, total: number, file: string) => void
  /**
   * 所有资源下载完毕、模型初始化完成并开始首帧渲染时触发
   */
  loaded: () => void
  /**
   * 调用 `setExpression()` 后立即触发，`id` 为切换目标的表情 ID
   */
  expressionchange: (id: string) => void
  /**
   * 调用 `playMotion()` 或随机动作被触发后，动作开始播放时触发
   */
  motionstart: (group: string, index: number, duration: number, file: string | null) => void
  /**
   * 当前动作播放完毕时触发
   */
  motionend: (group: string, index: number, file: string | null) => void
  /**
   * 调用 `destroy()` 后，WebGL 资源释放完成时触发
   */
  destroy: () => void
}
