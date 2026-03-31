import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig(({ mode }) => ({
  build: {
    emptyOutDir: mode === 'production',
    lib: {
      name: 'LIVE2D',
      entry: 'src/index.ts',
      formats: ['es', 'iife'],
      fileName: format => `index.${format === 'iife' ? 'min.js' : 'js'}`
    },
  },
  plugins: [dts({ rollupTypes: true })]
}));
