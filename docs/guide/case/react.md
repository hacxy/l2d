# 在React中使用

```tsx
// src/App.tsx
import { init, type L2D, type Model } from 'l2d';
import { useEffect, useState } from 'react';

function App() {
  const [live2d, setLive2d] = useState<L2D | null>(null);
  const [model, setModel] = useState<Model | null>(null);

  useEffect(() => {
    const canvas = document.getElementById('live2d') as HTMLCanvasElement;
    const l2d = init(canvas);
    setLive2d(l2d);
    return () => {
      setLive2d(null);
    };
  }, []);

  return (
    <main
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        gap: '10px',
        width: '100dvw',
        height: '100dvh',
      }}
    >
      <div
        style={{
          width: '300px',
          height: '300px',
          backgroundColor: 'lightblue',
        }}
      >
        <canvas id="live2d" />
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <button
          onClick={async () => {
            const model = await live2d!.create({
              path: 'https://model.hacxy.cn/HK416-1-normal/model.json',
              scale: 0.06,
            });
            setModel(model);
          }}
          disabled={live2d === null || model !== null}
        >
          加载模型
        </button>
        <button
          onClick={() => {
            model!.destroy();
            setModel(null);
          }}
          disabled={model === null}
        >
          清除模型
        </button>
      </div>
    </main>
  );
}

export default App;
```
