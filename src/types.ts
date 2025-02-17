export interface Emits {
  /**
   * 区域点击事件
   */
  hit: string[]
}

export interface Options {
  /**
   * 模型地址
   */
  path: string
  /**
   * 模型在画布中的横纵坐标
   */
  position?: [x: number, y: number] | 'center'
  /**
   * 模型的缩放比例
   */
  scale?: number | 'auto'
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

  /**
   * 动作同步资源路径
   */
  motionSync?: string
}
