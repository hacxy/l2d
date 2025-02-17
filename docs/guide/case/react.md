# 在React中使用

## 在标准的react项目中使用

通过 [stackblitz](https://stackblitz.com/edit/vitejs-vite-bhgfdzer?file=src%2FApp.tsx) 在线体验

```tsx
import { init, Model } from 'l2d';
import { useEffect, useRef } from 'react';

function App() {
  const l2dRef = useRef<HTMLCanvasElement>(null);
  let model: Model;
  useEffect(() => {
    const l2d = init(l2dRef.current!);
    l2d
      .create({
        path: 'https://model.hacxy.cn/shizuku/shizuku.model.json',
      })
      .then(res => {
        model = res;
      });

    return () => {
      model?.destroy();
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

```tsx
'use client';
import type { Model } from 'l2d';
import { useEffect, useRef } from 'react';

function Live2D() {
  const l2dRef = useRef<HTMLCanvasElement>(null);
  const model = useRef<Model>();
  useEffect(() => {
    import('l2d').then(({ init }) => {
      const l2d = init(l2dRef.current!);
      l2d
        .create({
          path: 'https://model.hacxy.cn/shizuku/shizuku.model.json',
        })
        .then(res => {
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
