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
  build: {
    lib: {
      name: 'LIVE2D',
      entry: 'src/index.ts',
      formats: ['es', 'iife'],
      fileName: format => `index.${format === 'iife' ? 'min.js' : 'js'}`,
    },
  },
  plugins: [dts()]
});
