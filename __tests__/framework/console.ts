const consolePanelEl = document.getElementById('console-panel') as HTMLDivElement;
const consoleToggleBtn = document.getElementById('console-toggle') as HTMLButtonElement;
const consoleClear = document.getElementById('console-clear') as HTMLButtonElement;
const consoleLog = document.getElementById('console-log') as HTMLDivElement;

const _log = console.log.bind(console);
const _warn = console.warn.bind(console);
const _error = console.error.bind(console);

function formatArgs(args: unknown[]): string {
  return args.map(a => (typeof a === 'object' ? JSON.stringify(a, null, 0) : String(a))).join(' ');
}

export function appendLog(level: 'log' | 'warn' | 'error', args: unknown[]): void {
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

export function clearConsoleLog(): void {
  consoleLog.innerHTML = '';
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

consoleClear.addEventListener('click', clearConsoleLog);
consoleToggleBtn.addEventListener('click', () => {
  const c = consolePanelEl.classList.toggle('collapsed');
  consoleToggleBtn.textContent = c ? '展开' : '折叠';
});
