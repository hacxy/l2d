import type Cubism2Model from './cubism2/index.js';
import type { AppDelegate as Cubism6Model } from './cubism6/index.js';
import logger from './logger.js';

export interface ModelState {
  currentVersion: number | null
  l2d2Model: Cubism2Model | null
  l2d6Model: Cubism6Model | null
}

export class MotionController {
  constructor(private state: ModelState) {}

  private isReady(method: string): boolean {
    if (this.state.currentVersion === null) {
      logger.warn(`${method}: 模型尚未加载完成，请在 loaded 事件触发后调用。`);
      return false;
    }
    return true;
  }

  playMotion(group: string, index?: number, priority?: number) {
    if (!this.isReady('playMotion'))
      return;
    if (this.state.currentVersion === 2)
      this.state.l2d2Model!.playMotion(group, index, priority);
    else
      this.state.l2d6Model!.playMotion(group, index, priority);
  }

  getMotionGroups(): Record<string, number> {
    if (!this.isReady('getMotionGroups'))
      return {};
    return this.state.currentVersion === 2
      ? this.state.l2d2Model!.getMotionGroups()
      : this.state.l2d6Model!.getMotionGroups();
  }

  getMotionFiles(): Record<string, string[]> {
    if (!this.isReady('getMotionFiles'))
      return {};
    return this.state.currentVersion === 2
      ? this.state.l2d2Model!.getMotionFiles()
      : this.state.l2d6Model!.getMotionFiles();
  }

  playMotionByFile(file: string, priority?: number) {
    const motionFiles = this.getMotionFiles();
    for (const [group, files] of Object.entries(motionFiles)) {
      const index = files.findIndex(f => f === file || f.startsWith(`${file}.`));
      if (index !== -1) {
        this.playMotion(group, index, priority);
        return;
      }
    }
  }
}
