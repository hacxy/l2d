# 在React中使用

```tsx
// src/App.tsx
import { init, type L2D, type Model } from 'l2d';
import { useEffect, useState } from 'react';

function App() {
  const [live2d, setLive2d] = useState<L2D | null>(null);
  const [model, setModel] = useState<Model | null>(null);

  // 初始化 l2d
  useEffect(() => {
    const canvas = document.getElementById('live2d') as HTMLCanvasElement;
    const l2d = init(canvas);
    setLive2d(l2d);
    return () => {
      setLive2d(null);
    };
  }, []);

  // 在组件卸载或者 model 变化时销毁 model
  useEffect(() => {
    return () => {
      if (model) {
        model.destroy();
      }
    };
  }, [model]);

  return (
    <main>
      <div>
        <canvas id="live2d" />
      </div>
      <div>
        <button
          onClick={async () => {
            const model = await live2d!.create({
              path: 'https://model.hacxy.cn/HK416-1-normal/model.json',
              scale: 0.1,
            });
            setModel(model);
          }}
          disabled={live2d === null || model !== null}
        >
          加载模型
        </button>
        <button
          onClick={() => setModel(null)}
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
