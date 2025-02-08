export interface Emits {
  hit: string
}

export interface Options {
  /**
   * 模型地址
   */
  path: string
  /**
   * 画布宽度
   */
  width?: number
  /**
   * 画布高度
   */
  height?: number
  /**
   * 模型在画布中的横坐标
   */
  x?: number
  /**
   * 模型在画布中的纵坐标
   */
  y?: number
  /**
   * 模型的缩放比例
   */
  scale?: number
  /**
   * 模型在画布中旋转的角度
   */
  rotaion?: number

  /**
   * 锚点位置, x: 横坐标距离  y:纵坐标距离
   */
  anchor?: [x: number, y: number]

  /**
   * 音量, 值为 0 - 1
   */
  volume?: number
}
