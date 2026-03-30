import type { Options } from './types.js';
import Cubism2Model from './cubism2/index.js';
import { AppDelegate as Cubism5Model } from './cubism5/index.js';
import { checkModelVersion } from './utils/model.js';

class L2D {
  private canvas: HTMLCanvasElement;
  private l2d2Model: Cubism2Model;
  private l2d5Model: Cubism5Model;
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.l2d2Model = new Cubism2Model(this.canvas);
    this.l2d5Model = new Cubism5Model(this.canvas);
  }

  async create(options: Options) {
    const res = await fetch(options.path);
    if (!res.ok) {
      console.error(`获取模型配置失败: ${res.statusText}`);
      return;
    }
    const result = await res.json();
    const version = checkModelVersion(result);
    if (version === 2) {
      await this.l2d2Model.init(this.canvas, options.path, result);
      if (options.position) {
        this.l2d2Model.setPosition(options.position[0], options.position[1]);
      }
    }
    else {
      // 初始化 Cubism5 模型
      if (!this.l2d5Model.initialize()) {
        console.error('Failed to initialize Cubism5 model');
        return;
      }
      if (options.position) {
        this.l2d5Model.setPosition(options.position[0], options.position[1]);
      }
      this.l2d5Model.changeModel(options.path);
      this.l2d5Model.run();
    }
  }
}

export default L2D;
