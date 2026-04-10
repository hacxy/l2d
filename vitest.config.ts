import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@framework': path.resolve(__dirname, 'src/vendor/cubism6/Framework/src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['__tests__/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: [
        'src/vendor/**',
        'src/types.ts', // 纯 interface 定义，无可执行代码
        'src/vite-env.d.ts', // 声明文件
        'src/const.ts', // 空文件
      ],
    },
  },
});
