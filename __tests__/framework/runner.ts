/// <reference types="vite/client" />
import type { Demo, L2D } from '../demo-types';
import { updateCodePanel } from './code';
import { clearConsoleLog } from './console';
import { appendErrorToStage, clearStage, createInstance } from './stage';

const modules = import.meta.glob<{ default: Demo }>('../demo/*.ts', { eager: true });

const listEl = document.getElementById('demo-list') as HTMLUListElement;
const titleEl = document.getElementById('demo-title') as HTMLSpanElement;
const reloadBtn = document.getElementById('reload-btn') as HTMLButtonElement;

function stemOf(key: string): string {
  return key.replace(/^.*\//, '').replace(/\.ts$/, '');
}

export const demos = Object.entries(modules)
  .map(([key, mod]) => ({ stem: stemOf(key), demo: (mod as { default: Demo }).default }))
  .sort((a, b) => a.stem.localeCompare(b.stem));

let activeIndex = -1;
let cleanup: (() => void) | null = null;
let activeInstances: L2D[] = [];

export function buildSidebar(): void {
  demos.forEach(({ stem, demo }, i) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    const titleSpan = document.createElement('span');
    titleSpan.textContent = demo.title ?? stem;
    const stemSpan = document.createElement('span');
    stemSpan.className = 'stem';
    stemSpan.textContent = stem;
    btn.appendChild(titleSpan);
    btn.appendChild(stemSpan);
    btn.addEventListener('click', () => runDemo(i));
    li.appendChild(btn);
    listEl.appendChild(li);
  });
}

export function runDemo(index: number, force = false): void {
  if (index === activeIndex && !force)
    return;

  if (typeof cleanup === 'function') {
    try {
      cleanup();
    }
    catch (e) {
      console.error('[demo] cleanup error:', e);
    }
    cleanup = null;
  }

  for (const l2d of activeInstances)
    l2d.destroy();
  activeInstances = [];

  clearStage();
  clearConsoleLog();

  listEl.querySelectorAll('li').forEach((li, i) => li.classList.toggle('active', i === index));
  activeIndex = index;
  const { stem, demo } = demos[index];
  titleEl.textContent = demo.title ?? stem;
  history.replaceState(null, '', `?demo=${stem}`);
  updateCodePanel(stem);

  const l2ds = Array.from({ length: demo.canvasCount ?? 1 }, createInstance);
  activeInstances = l2ds;

  try {
    const result = demo.setup(l2ds);
    cleanup = typeof result === 'function' ? result : null;
  }
  catch (e) {
    const msg = e instanceof Error ? `${e.message}\n${e.stack ?? ''}` : String(e);
    console.error('[demo] setup error in', stem, ':', e);
    appendErrorToStage(msg);
  }
}

reloadBtn.addEventListener('click', () => runDemo(activeIndex, true));
