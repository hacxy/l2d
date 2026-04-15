---
sidebar:
  sort: 5
---

# 声音与音量

部分 Live2D 模型的动作文件关联了角色语音，播放动作时会同步播放对应的声音。本章介绍声音文件的配置方式以及如何通过 l2d 控制音量。

## 声音文件的配置方式

在 `model3.json` 中，声音通过动作条目的 `Sound` 字段与动作关联：

```json
"Motions": {
  "TapBody": [
    {
      "File": "motions/tap_01.motion3.json",
      "Sound": "sounds/voice_01.ogg"
    }
  ]
}
```

当调用 `l2d.playMotion('TapBody', 0)` 时，l2d 会在播放动作的同时自动播放 `sounds/voice_01.ogg`。

> 不是所有动作都有关联的声音。只有配置了 `Sound` 字段的动作才会播放声音。可以通过 `getMotions()` 查看动作列表，在 `model3.json` 中查找哪些动作配置了声音。

## 默认静音

::: warning 为什么默认静音？
浏览器的自动播放策略要求用户与页面发生交互（点击、按键等）后才能播放音频。**l2d 默认将音量设为 `0`（静音）**，防止模型加载完成后立即播放声音，在用户未预期的情况下造成困扰。
:::

使用前需要主动设置音量。

## 设置音量

音量范围为 `0`（静音）到 `1`（最大），支持两种方式：

### 加载时指定

```ts
l2d.load({
  path: "https://model.hacxy.cn/Haru/Haru.model3.json",
  volume: 0.8,
});
```

### 动态调整

```ts
// 在用户交互后开启声音（符合浏览器自动播放策略）
document.addEventListener(
  "click",
  () => {
    l2d.setVolume(0.8);
  },
  { once: true },
);
```

## 音量控制示例

为模型添加一个音量滑块：

```html
<canvas id="canvas" style="width: 300px; height: 400px;"></canvas>
<label>
  音量：
  <input
    type="range"
    id="volume-slider"
    min="0"
    max="1"
    step="0.01"
    value="0"
  />
</label>
```

```ts
import { init } from "l2d";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const slider = document.getElementById("volume-slider") as HTMLInputElement;
const l2d = init(canvas);

slider.addEventListener("input", () => {
  l2d.setVolume(Number(slider.value));
});

l2d.load({
  path: "https://model.hacxy.cn/Haru/Haru.model3.json",
});
```

## 注意事项

- 即使设置了音量，在用户与页面发生交互之前，部分浏览器仍可能阻止声音播放。建议在用户点击等交互事件中再开启音量。
- 声音文件由模型作者提供，并非所有模型都包含语音。
          |
