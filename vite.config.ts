import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    ssr: true,
    lib: {
      name: 'LIVE2D',
      entry: 'src/index.ts',
      formats: ['es', 'iife'],
      fileName: format => `index.${format === 'iife' ? 'min.js' : 'js'}`
    },
  },
  plugins: [dts()]
});
