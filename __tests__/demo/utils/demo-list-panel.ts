import type { L2D } from '../../demo-types';

/** 动作 / 表情等底部紧凑列表面板（与 canvas-wrapper 同宽） */
export const DEMO_PANEL_COMPACT
  = 'position:absolute;bottom:6px;left:6px;right:6px;z-index:2;max-height:min(132px,38%);overflow:auto;padding:5px 6px;border:1px solid #444;border-radius:5px;background:rgba(12,12,12,0.88);box-sizing:border-box';

export const DEMO_LIST_HEADING_COMPACT
  = 'font-size:9px;color:#777;margin-bottom:5px;font-family:system-ui,sans-serif';

export const DEMO_LIST_COLUMN
  = 'display:flex;flex-direction:column;gap:4px';

/** 表情列表等单行文字按钮 */
export const DEMO_BTN_COMPACT
  = 'width:100%;padding:4px 6px;border:1px solid #555;border-radius:3px;cursor:pointer;text-align:left;font-family:ui-monospace,monospace;font-size:8px;color:#ccc;background:rgba(0,0,0,0.2)';

/** 动作行：带进度条的按钮外观 */
export const DEMO_BTN_MOTION_ROW
  = 'display:flex;flex-direction:column;align-items:stretch;gap:3px;width:100%;padding:4px 5px;border:1px solid #555;border-radius:3px;cursor:pointer;text-align:left;font-family:ui-monospace,monospace;font-size:8px;color:#ccc;background:rgba(0,0,0,0.2)';

/** 模型切换等较宽网格列表 */
export const DEMO_PANEL_WIDE
  = 'position:absolute;bottom:8px;left:8px;right:8px;z-index:2;max-height:140px;overflow:auto;padding:8px;border:1px solid #444;border-radius:5px;background:rgba(15,15,15,0.8);box-sizing:border-box';

export const DEMO_LIST_HEADING_WIDE
  = 'font-size:12px;color:#aaa;margin-bottom:6px;font-family:system-ui,sans-serif';

export const DEMO_LIST_GRID
  = 'list-style:none;padding:0;margin:0;display:grid;gap:6px';

export interface CompactListPanel {
  panel: HTMLDivElement
  heading: HTMLDivElement
  list: HTMLDivElement
  mount: (l2d: L2D) => void
}

export function createCompactListPanel(headingText: string): CompactListPanel {
  const panel = document.createElement('div');
  panel.style.cssText = DEMO_PANEL_COMPACT;
  const heading = document.createElement('div');
  heading.textContent = headingText;
  heading.style.cssText = DEMO_LIST_HEADING_COMPACT;
  const list = document.createElement('div');
  list.style.cssText = DEMO_LIST_COLUMN;
  panel.append(heading, list);
  return {
    panel,
    heading,
    list,
    mount(l2d) {
      l2d.getCanvas().parentElement?.append(panel);
    },
  };
}

export interface WideGridListPanel {
  panel: HTMLDivElement
  heading: HTMLDivElement
  list: HTMLUListElement
  mount: (l2d: L2D) => void
}

export function createWideGridListPanel(headingText: string): WideGridListPanel {
  const panel = document.createElement('div');
  panel.style.cssText = DEMO_PANEL_WIDE;
  const heading = document.createElement('div');
  heading.textContent = headingText;
  heading.style.cssText = DEMO_LIST_HEADING_WIDE;
  const list = document.createElement('ul');
  list.style.cssText = DEMO_LIST_GRID;
  panel.append(heading, list);
  return {
    panel,
    heading,
    list,
    mount(l2d) {
      l2d.getCanvas().parentElement?.append(panel);
    },
  };
}
