export interface Options {
  path: string
  position?: [x: number, y: number]
  scale?: number
  width?: number
  height?: number
}

export interface L2DEventMap {
  loaded: () => void
  tap: (areaName: string) => void
}
