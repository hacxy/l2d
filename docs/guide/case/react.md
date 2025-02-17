---
sidebar:
  icon: mdi:react
  text: React
---

# 在React中使用

## 在标准的react项目中使用

通过 [stackblitz](https://stackblitz.com/edit/vitejs-vite-bhgfdzer?file=src%2FApp.tsx) 在线体验

```tsx
import { init, Model } from 'l2d';
import { useEffect, useRef } from 'react';

function App() {
  const l2dRef = useRef<HTMLCanvasElement>(null);
  const model = useRef<Model>();
  useEffect(() => {
    const l2d = init(l2dRef.current);
    l2d.create({
      path: 'https://model.hacxy.cn/shizuku/shizuku.model.json',
    }).then(res => {
      model.current = res;
    });

    return () => {
      model.current?.destroy();
    };
  }, []);
  return (
    <div style={{ width: '300px', height: '300px' }}>
      <canvas ref={l2dRef} />
    </div>
  );
}

export default App;
```

## 在Nextjs中使用

通过 [stackblitz](https://stackblitz.com/edit/stackblitz-starters-p3nascfd?file=app%2Flive2d.tsx) 在线体验

:::tip

如果组件中使用了`useRef`, 则需要在文件顶部声明 'use client', 表示该组件只会在客户端执行

由于 `l2d` 使用了浏览器方法, 所以在Nextjs中需要使用动态导入 `import()`
:::

```tsx
'use client';
import type { Model } from 'l2d';
import { useEffect, useRef } from 'react';

function Live2D() {
  const l2dRef = useRef<HTMLCanvasElement>(null);
  const model = useRef<Model>();
  useEffect(() => {
    import('l2d').then(({ init }) => {
      const l2d = init(l2dRef.current);
      l2d.create({
        path: 'https://model.hacxy.cn/shizuku/shizuku.model.json',
      }).then(res => {
        model.current = res;
      });
    });

    return () => {
      model.current?.destroy();
    };
  }, []);

  return (
    <div style={{ width: '300px', height: '300px' }}>
      <canvas ref={l2dRef} />
    </div>
  );
}

export default Live2D;
```
