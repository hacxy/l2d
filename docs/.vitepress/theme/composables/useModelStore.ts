import { ref } from 'vue';

const BASE = 'https://model.hacxy.cn';

export interface ModelItem {
  dir: string
  file: string
  path: string
  version: 2 | 6
}

const models = ref<ModelItem[]>([]);
const loading = ref(false);
const error = ref('');
let started = false;

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

function getVersion(file: string): 2 | 6 {
  return file.endsWith('.model3.json') ? 6 : 2;
}

export async function prefetchModels() {
  if (started)
    return;
  started = true;
  loading.value = true;
  error.value = '';

  const rootHtml = await fetchText(`${BASE}/`);
  if (!rootHtml) {
    error.value = '无法连接到模型服务器';
    loading.value = false;
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
      dir: name,
      file: jsonFile,
      path: `${BASE}/${name}/${jsonFile}`,
      version: getVersion(jsonFile),
    } satisfies ModelItem;
  }));

  models.value = results.filter((m): m is ModelItem => m !== null);
  loading.value = false;
}

export function useModelStore() {
  return { models, loading, error };
}
