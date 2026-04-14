---
sidebar:
  sort: 2
---

# 动作系统

Live2D 模型内置了一系列预定义的动作，例如待机摇摆、点击反应、特殊动画等。本章介绍动作的组织方式以及如何在 l2d 中获取和播放它们。

## 动作的组织方式

回顾[认识 Live2D 模型文件](./model-files)一章，动作以**分组**的形式定义在 `model3.json` 的 `Motions` 字段中：

```json
"Motions": {
  "Idle": [
    { "File": "motions/idle_01.motion3.json" },
    { "File": "motions/idle_02.motion3.json" }
  ],
  "TapBody": [
    { "File": "motions/tap_01.motion3.json" },
    { "File": "motions/tap_02.motion3.json" }
  ]
}
```

每个分组（如 `Idle`、`TapBody`）可以包含多个动作文件，通过**下标（0、1、2…）**来区分。

常见的分组命名惯例：

| 分组名    | 通常用途                         |
| --------- | -------------------------------- |
| `Idle`    | 待机动作，模型空闲时自动循环播放 |
| `TapBody` | 点击身体触发                     |
| `TapHead` | 点击头部触发                     |
| `Special` | 特殊动作                         |

> 分组名由模型作者决定，不同模型的分组名可能完全不同。建议先用 `getMotions()` 查看当前模型有哪些分组。

## 获取所有动作

加载完成后，使用 `getMotions()` 获取模型的所有动作，返回一个以分组名为键、动作文件路径数组为值的字典：

```ts
l2d.on("loaded", () => {
  const motions = l2d.getMotions();
  console.log(motions);
  // {
  //   "Idle":    ["motions/idle_01.motion3.json", "motions/idle_02.motion3.json"],
  //   "TapBody": ["motions/tap_01.motion3.json"]
  // }
});
```

> `getMotions()` 必须在 `loaded` 事件触发之后调用，此时模型文件已完成解析。

## 播放指定动作

使用 `playMotion(group, index?, priority?)` 播放动作：

```ts
// 播放 Idle 分组的第 0 个动作
l2d.playMotion("Idle", 0);

// 播放 TapBody 分组的第 1 个动作
l2d.playMotion("TapBody", 1);

// 省略 index，从 Idle 分组中随机选一个播放
l2d.playMotion("Idle");
```

### 优先级（priority）

当多个动作同时触发时，优先级数值越大，越优先播放。低优先级的动作会被高优先级的动作打断：

```ts
l2d.playMotion("Idle", 0, 1); // 待机动作，低优先级
l2d.playMotion("TapBody", 0, 3); // 用户交互触发，高优先级，会打断待机
```

推荐约定：

- 待机等自动播放的动作：优先级 `1` 或 `2`
- 用户主动触发的动作（点击、交互）：优先级 `3`

## 通过文件路径播放

如果你知道动作的具体文件路径，也可以用 `playMotionByFile()` 直接播放，不需要知道它属于哪个分组：

```ts
l2d.playMotionByFile("motions/tap_01.motion3.json");
l2d.playMotionByFile("motions/tap_01.motion3.json", 3); // 带优先级
```

## 监听动作事件

```ts
l2d.on('motionstart', (group, index, duration, file) => {
  const dur = duration > 0 ? `${duration}s` : '未知';
  console.log(`动作开始: ${group}[${index}]，时长: ${dur}`);
});

l2d.on('motionend', (group, index, file) => {
  console.log(`动作结束: ${group}[${index}]`);
});
```

| 参数       | 类型             | 说明                                                                  |
| ---------- | ---------------- | --------------------------------------------------------------------- |
| `group`    | `string`         | 动作所在分组名                                                        |
| `index`    | `number`         | 在分组中的下标                                                        |
| `duration` | `number`         | 动作时长（秒），来自动作文件的 `Meta.Duration`；若文件未定义则为 `-1` |
| `file`     | `string \| null` | 动作文件路径                                                          |

## 动作与声音联动

如果模型的 `model3.json` 在动作条目上配置了 `Sound` 字段，播放该动作时会自动播放对应的声音文件：

```json
"TapBody": [
  {
    "File": "motions/tap_01.motion3.json",
    "Sound": "sounds/voice_01.ogg"
  }
]
```

声音默认静音（音量为 `0`），音量控制详见[声音与音量](./sound)章节。

## 实际应用：点击触发动作

结合 `tap` 事件和 `playMotion()`，可以实现点击模型不同部位触发不同动作的交互效果：

```ts
l2d.on("tap", (areaName) => {
  if (areaName === "Body") {
    l2d.playMotion("TapBody", undefined, 3);
  } else if (areaName === "Head") {
    l2d.playMotion("TapHead", undefined, 3);
  }
});
```

关于 Hit Area 和 `tap` 事件的详细说明，参见[模型事件](./events)章节。
