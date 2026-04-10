import type { ModelState } from './motion-controller.js';
import logger from './logger.js';

export class ExpressionController {
  constructor(private state: ModelState) {}

  private isReady(method: string): boolean {
    if (this.state.currentVersion === null) {
      logger.warn(`${method}: model not loaded yet, call this after the loaded event.`);
      return false;
    }
    return true;
  }

  getExpressions(): string[] {
    if (!this.isReady('getExpressions'))
      return [];
    return this.state.currentVersion === 2
      ? this.state.l2d2Model!.getExpressions()
      : this.state.l2d6Model!.getExpressions();
  }

  setExpression(id?: string) {
    if (!this.isReady('setExpression'))
      return;
    if (this.state.currentVersion === 2)
      this.state.l2d2Model!.setExpression(id);
    else
      this.state.l2d6Model!.setExpression(id);
  }
}
