import type Cubism2Model from './cubism2/index.js';
import type { AppDelegate as Cubism6Model } from './cubism6/index.js';
import { isNumber } from '@hacxy/utils';
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
      logger.warn(`${method}: model not loaded yet, call this after the loaded event.`);
      return false;
    }
    return true;
  }

  playMotion(group: string, index?: number, priority?: number) {
    if (!this.isReady('playMotion'))
      return;
    const groups = this.getMotionGroups();
    const count = groups[group];
    if (!isNumber(count)) {
      logger.warn(`playMotion: motion group "${group}" not found.`);
      return;
    }
    if (isNumber(index) && (index < 0 || index >= count)) {
      logger.warn(`playMotion: motion index ${index} out of range for group "${group}" (0-${count - 1}).`);
      return;
    }
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
    logger.warn(`playMotionByFile: motion file "${file}" not found.`);
  }
}
