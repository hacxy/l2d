import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: '__tests__',
  base: './',
  build: {
    outDir: path.resolve(__dirname, 'demo-dist'),
    emptyOutDir: true,
  },
});
