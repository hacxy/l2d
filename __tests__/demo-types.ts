import type { L2D } from '../dist';

export type { L2D };

export interface Demo {
  /** 侧边栏显示名，缺省用文件名 */
  title?: string
  /** 需要几个实例，默认 1 */
  canvasCount?: number
  /**
   * 接收框架创建好的 L2D 实例数组，启动 demo 逻辑。
   * 可返回 cleanup 函数，切换 demo 时自动调用（无需手动 destroy）。
   */
  setup: (l2ds: L2D[]) => (() => void) | void
}
