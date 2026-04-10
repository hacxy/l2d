/// <reference types="vite/client" />
import type { Demo } from './demo-types';

const modules = import.meta.glob<{ default: Demo }>('./demo/*.ts', { eager: true });

const listEl = document.getElementById('demo-list') as HTMLUListElement;
const stageEl = document.getElementById('stage') as HTMLDivElement;
const titleEl = document.getElementById('demo-title') as HTMLSpanElement;
const reloadBtn = document.getElementById('reload-btn') as HTMLButtonElement;
const consoleClear = document.getElementById('console-clear') as HTMLButtonElement;
const consoleLog = document.getElementById('console-log') as HTMLDivElement;

function stemOf(key: string): string {
  return key.replace(/^.*\//, '').replace(/\.ts$/, '');
}

const demos = Object.entries(modules)
  .map(([key, mod]) => ({ stem: stemOf(key), demo: (mod as { default: Demo }).default }))
  .sort((a, b) => a.stem.localeCompare(b.stem));

let activeIndex = -1;
let cleanup: (() => void) | null = null;

const canvasOverlays = new Map<HTMLCanvasElement, { el: HTMLDivElement, text: HTMLSpanElement, bar: HTMLDivElement }>();

function createCanvasWithOverlay(): HTMLCanvasElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'canvas-wrapper';
  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 400;
  const overlay = document.createElement('div');
  overlay.className = 'canvas-loading';
  overlay.innerHTML = '<div class="spinner"></div><span class="loading-text">Loading...</span><div class="loading-track"><div class="loading-bar"></div></div>';
  wrapper.appendChild(canvas);
  wrapper.appendChild(overlay);
  stageEl.appendChild(wrapper);
  canvasOverlays.set(canvas, {
    el: overlay,
    text: overlay.querySelector('.loading-text') as HTMLSpanElement,
    bar: overlay.querySelector('.loading-bar') as HTMLDivElement,
  });
  return canvas;
}

window.addEventListener('live2d:loadstart', (e: Event) => {
  const { canvas, total } = (e as CustomEvent).detail as { canvas: HTMLCanvasElement, total: number };
  const ov = canvasOverlays.get(canvas);
  if (!ov)
    return;
  ov.el.classList.remove('done');
  ov.text.textContent = `0 / ${total}`;
  ov.bar.style.width = '0%';
});

window.addEventListener('live2d:loadprogress', (e: Event) => {
  const { canvas, loaded, total } = (e as CustomEvent).detail as { canvas: HTMLCanvasElement, loaded: number, total: number };
  const ov = canvasOverlays.get(canvas);
  if (!ov)
    return;
  ov.text.textContent = `${loaded} / ${total}`;
  ov.bar.style.width = `${Math.round((loaded / total) * 100)}%`;
  if (loaded >= total)
    setTimeout(() => ov.el.classList.add('done'), 300);
});

// ── sidebar ──────────────────────────────────────────────────────────────────

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

// ── console intercept ─────────────────────────────────────────────────────────

const _log = console.log.bind(console);
const _warn = console.warn.bind(console);
const _error = console.error.bind(console);

function formatArgs(args: unknown[]): string {
  return args.map(a => (typeof a === 'object' ? JSON.stringify(a, null, 0) : String(a))).join(' ');
}

function appendLog(level: 'log' | 'warn' | 'error', args: unknown[]): void {
  const entry = document.createElement('div');
  entry.className = `log-entry ${level}`;

  const time = document.createElement('span');
  time.className = 'log-time';
  const now = new Date();
  time.textContent = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

  const text = document.createElement('span');
  text.textContent = formatArgs(args);

  entry.appendChild(time);
  entry.appendChild(text);
  consoleLog.appendChild(entry);
  consoleLog.scrollTop = consoleLog.scrollHeight;
}

console.log = (...args: unknown[]) => {
  _log(...args);
  appendLog('log', args);
};
console.warn = (...args: unknown[]) => {
  _warn(...args);
  appendLog('warn', args);
};
console.error = (...args: unknown[]) => {
  _error(...args);
  appendLog('error', args);
};

consoleClear.addEventListener('click', () => {
  consoleLog.innerHTML = '';
});

// ── demo runner ───────────────────────────────────────────────────────────────

function runDemo(index: number, force = false): void {
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

  stageEl.innerHTML = '';
  consoleLog.innerHTML = '';
  canvasOverlays.clear();

  listEl.querySelectorAll('li').forEach((li, i) => li.classList.toggle('active', i === index));

  activeIndex = index;
  const { stem, demo } = demos[index];

  titleEl.textContent = demo.title ?? stem;
  history.replaceState(null, '', `?demo=${stem}`);

  const count = demo.canvasCount ?? 1;
  const canvases = Array.from({ length: count }, createCanvasWithOverlay);

  try {
    const result = demo.setup(canvases);
    cleanup = typeof result === 'function' ? result : null;
  }
  catch (e) {
    const msg = e instanceof Error ? `${e.message}\n${e.stack ?? ''}` : String(e);
    console.error('[demo] setup error in', stem, ':', e);
    const errEl = document.createElement('div');
    errEl.className = 'error-msg';
    errEl.textContent = msg;
    stageEl.appendChild(errEl);
  }
}

reloadBtn.addEventListener('click', () => runDemo(activeIndex, true));

// ── init: restore from URL or run first ──────────────────────────────────────

const urlStem = new URLSearchParams(location.search).get('demo');
const initialIndex = urlStem ? demos.findIndex(d => d.stem === urlStem) : 0;

if (demos.length > 0)
  runDemo(initialIndex >= 0 ? initialIndex : 0);

// ── model panel ──────────────────────────────────────────────────────────────

const BASE = 'https://model.hacxy.cn';
const modelListEl = document.getElementById('model-list') as HTMLUListElement;
const toastEl = document.getElementById('copy-toast') as HTMLDivElement;

interface ModelItem {
  name: string
  path: string
  version: 2 | 6
}

async function fetchText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    return res.ok ? res.text() : null;
  }
  catch {
    return null;
  }
}

function parseLinks(html: string): string[] {
  return [...html.matchAll(/href="([^"]+)"/g)]
    .map(m => m[1])
    .filter(h => !h.startsWith('?') && h !== '../');
}

async function loadModels(): Promise<void> {
  const rootHtml = await fetchText(`${BASE}/`);
  if (!rootHtml) {
    modelListEl.innerHTML = '<li class="status">无法连接到模型服务器</li>';
    return;
  }

  const dirs = parseLinks(rootHtml).filter(l => l.endsWith('/'));

  const results = await Promise.all(dirs.map(async dir => {
    const name = dir.replace(/\/$/, '');
    const dirHtml = await fetchText(`${BASE}/${name}/`);
    if (!dirHtml)
      return null;

    const files = parseLinks(dirHtml);
    const jsonFile = files.find(f =>
      f.endsWith('.model3.json')
      || f.endsWith('.model.json')
      || f === 'index.json'
      || f === 'model.json',
    );
    if (!jsonFile)
      return null;

    return {
      name,
      path: `${BASE}/${name}/${jsonFile}`,
      version: jsonFile.endsWith('.model3.json') ? 6 : 2,
    } as ModelItem;
  }));

  const models = results.filter((m): m is ModelItem => m !== null);

  if (models.length === 0) {
    modelListEl.innerHTML = '<li class="status">未找到模型</li>';
    return;
  }

  modelListEl.innerHTML = '';
  models.forEach(model => {
    const li = document.createElement('li');
    const btn = document.createElement('button');

    const nameSpan = document.createElement('span');
    nameSpan.className = 'model-name';
    nameSpan.textContent = model.name;

    const badge = document.createElement('span');
    badge.className = `badge c${model.version}`;
    badge.textContent = `C${model.version}`;

    btn.appendChild(nameSpan);
    btn.appendChild(badge);
    btn.title = model.path;
    btn.addEventListener('click', () => copyPath(model.path));

    li.appendChild(btn);
    modelListEl.appendChild(li);
  });
}

let toastTimer: ReturnType<typeof setTimeout> | null = null;

function copyPath(path: string): void {
  navigator.clipboard.writeText(path).then(() => {
    toastEl.textContent = 'Copied!';
    toastEl.classList.add('show');
    if (toastTimer)
      clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1500);
  });
}

loadModels();
