/// <reference types="vite/client" />

const rawSources = import.meta.glob<string>('../demo/*.ts', {
  query: '?raw',
  import: 'default',
  eager: true,
});
const codeFileEl = document.getElementById('code-file') as HTMLSpanElement;
const codePreEl = document.querySelector('#code-view pre') as HTMLPreElement;
const codePanelEl = document.getElementById('code-panel') as HTMLDivElement;
const codeToggleBtn = document.getElementById('code-toggle') as HTMLButtonElement;

function extractSetupCode(source: string): string {
  const setupIdx = source.indexOf('setup(');
  if (setupIdx === -1)
    return '';
  const braceStart = source.indexOf('{', setupIdx) + 1;
  let depth = 1;
  let i = braceStart;
  while (i < source.length && depth > 0) {
    if (source[i] === '{')
      depth++;
    else if (source[i] === '}')
      depth--;
    i++;
  }
  let body = source.slice(braceStart, i - 1);
  const returnMatch = body.match(/\n {4}return[\s;]/);
  if (returnMatch)
    body = body.slice(0, returnMatch.index);
  return body.replace(/^\n/, '').trimEnd();
}

export function updateCodePanel(stem: string): void {
  const raw = rawSources[`../demo/${stem}.ts`];
  codeFileEl.textContent = `${stem}.ts`;
  codePreEl.textContent = raw ? extractSetupCode(raw) : '';
}

codeToggleBtn.addEventListener('click', () => {
  const collapsed = codePanelEl.classList.toggle('collapsed');
  codeToggleBtn.textContent = collapsed ? '展开' : '折叠';
});
