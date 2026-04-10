import path from 'node:path';
import { createLogger, defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

const logger = createLogger();
const loggerWarn = logger.warn;
logger.warn = (msg, options) => {
  // 忽略nodejs模块警告
  if (msg.includes('has been externalized for browser compatibility'))
    return;
  loggerWarn(msg, options);
};

export default defineConfig({
  customLogger: logger,
  resolve: {
    alias: {
      '@framework': path.resolve(__dirname, 'src/cubism6/Framework/src'),
    },
  },
  build: {
    lib: {
      name: 'L2D',
      entry: 'src/index.ts',
      formats: ['es', 'iife'],
      fileName: format => `index.${format === 'iife' ? 'min.js' : 'js'}`,
    },
  },
  plugins: [
    dts(),
    {
      name: 'suppress-cubism-core-log',
      transform(code: string, id: string) {
        if (id.endsWith('live2dcubismcore.js')) {
          return `const __c=console.log;console.log=()=>{};${code}\nconsole.log=__c;`;
        }
      },
    },
  ],
});
