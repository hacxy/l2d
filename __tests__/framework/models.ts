const BASE = 'https://model.hacxy.cn';
const modelListEl = document.getElementById('model-list') as HTMLUListElement;
const toastEl = document.getElementById('copy-toast') as HTMLDivElement;

interface ModelItem { name: string, path: string, version: 2 | 6 }

async function fetchText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    return res.ok ? res.text() : null;
  }
  catch { return null; }
}

function parseLinks(html: string): string[] {
  return [...html.matchAll(/href="([^"]+)"/g)]
    .map(m => m[1])
    .filter(h => !h.startsWith('?') && h !== '../');
}

let toastTimer: ReturnType<typeof setTimeout> | null = null;

export function copyPath(path: string): void {
  navigator.clipboard.writeText(path).then(() => {
    toastEl.textContent = 'Copied!';
    toastEl.classList.add('show');
    if (toastTimer)
      clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1500);
  });
}

export async function loadModels(): Promise<void> {
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
      f.endsWith('.model3.json') || f.endsWith('.model.json') || f === 'index.json' || f === 'model.json',
    );
    if (!jsonFile)
      return null;
    return { name, path: `${BASE}/${name}/${jsonFile}`, version: jsonFile.endsWith('.model3.json') ? 6 : 2 } as ModelItem;
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
