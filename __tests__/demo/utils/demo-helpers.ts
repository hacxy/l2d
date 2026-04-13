export function motionRowKey(group: string, index: number) {
  return `${group}\0${index}`;
}

export function motionStem(file: string) {
  return file
    .replace(/^.*\//, '')
    .replace(/\.motion3\.json$/i, '')
    .replace(/\.motion\.json$/i, '')
    .replace(/\.mtn$/i, '')
    .replace(/\.json$/i, '');
}

export function modelPathLabel(path: string) {
  const cleaned = path.endsWith('/') ? path.slice(0, -1) : path;
  const segments = cleaned.split('/');
  return segments.length >= 2 ? segments[segments.length - 2]! : path;
}
