export interface Demo {
  /** 侧边栏显示名，缺省用文件名 */
  title?: string
  /** 需要几个 canvas，默认 1 */
  canvasCount?: number
  /**
   * 接收创建好的 canvas 数组，启动 demo 逻辑。
   * 可返回 cleanup 函数，切换 demo 时自动调用。
   */
  setup: (canvases: HTMLCanvasElement[]) => (() => void) | void
}
