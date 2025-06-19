import type { MotionPreload } from './constants';

export interface Emits {
  /**
   * 可点击区域被点击
   */
  hit: string[]

  /**
   * 动作更新之后
   */
  afterMotionUpdate: undefined

  /**
   * setting json 文件加载完毕
   */
  settingsJSONLoaded: Record<string, any>

  /**
   * 设置加载完毕
   */
  settingsLoaded: Record<string, any>

  /**
   * texture文件加载完毕
   */
  textureLoaded: undefined

  /**
   * 模型加载完毕
   */
  modelLoaded: undefined

  /**
   * 所有必要文件加载完毕
   */
  ready: undefined
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
   * 动作文件预加载策略
   */
  motionPreload?: MotionPreload
}
