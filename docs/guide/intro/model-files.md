---
sidebar:
  sort: 2
---

# 认识 Live2D 模型文件

在开始使用l2d之前，先来了解 Live2D 模型是由哪些文件组成的。这些知识将帮助你理解 l2d 各个 API 在做什么，以及遇到问题时如何排查。

## Live2D 的两个版本

目前市面上的 Live2D 模型主要分为两个版本，l2d 均支持：

| 版本     | 入口文件后缀   | 说明                                      |
| -------- | -------------- | ----------------------------------------- |
| Cubism 2 | `.model.json`  | 较早期的格式，部分老模型使用              |
| Cubism 6 | `.model3.json` | 当前主流格式，Cubism 3 及以上均使用此格式 |

> 你可以通过入口文件的后缀来判断模型版本。l2d 会自动识别，无需手动指定。

## Cubism 6 模型（.model3.json）

Cubism 6 是目前最主流的 Live2D 版本，一个模型的目录结构通常如下：

```
Haru/
├── Haru.model3.json          ← 入口文件（传给 l2d 的路径）
├── Haru.moc3                 ← 模型网格数据（二进制）
├── Haru.2048/
│   └── texture_00.png        ← 贴图文件
├── Haru.physics3.json        ← 物理效果（头发、衣物的摆动）
├── Haru.pose3.json           ← 姿势定义
├── expressions/
│   ├── f01.exp3.json         ← 表情文件
│   └── f02.exp3.json
├── motions/
│   ├── Haru_m01.motion3.json ← 动作文件
│   └── Haru_m02.motion3.json
└── sounds/
    └── Haru_voice_1.ogg      ← 声音文件（部分模型包含）
```

### model3.json 结构解析

`.model3.json` 是模型的入口文件，调用 `l2d.load()` 时传入的就是这个文件的路径。它的内容大致如下：

```json
{
  "Version": 3,
  "FileReferences": {
    "Moc": "Haru.moc3",
    "Textures": ["Haru.2048/texture_00.png"],
    "Physics": "Haru.physics3.json",
    "Pose": "Haru.pose3.json",
    "Expressions": [
      { "Name": "f01", "File": "expressions/f01.exp3.json" },
      { "Name": "f02", "File": "expressions/f02.exp3.json" }
    ],
    "Motions": {
      "Idle": [
        {
          "File": "motions/Haru_m01.motion3.json",
          "FadeInTime": 0.5,
          "FadeOutTime": 0.5
        }
      ],
      "TapBody": [
        {
          "File": "motions/Haru_m02.motion3.json",
          "Sound": "sounds/Haru_voice_1.ogg"
        }
      ]
    }
  },
  "Groups": [
    {
      "Target": "Parameter",
      "Name": "EyeBlink",
      "Ids": ["ParamEyeLOpen", "ParamEyeROpen"]
    },
    {
      "Target": "Parameter",
      "Name": "LipSync",
      "Ids": ["ParamMouthOpenY"]
    }
  ],
  "HitAreas": [{ "Id": "HitArea", "Name": "Body" }]
}
```

各字段与 l2d API 的对应关系：

| 字段                         | 说明                                                 | 对应 l2d API                                    |
| ---------------------------- | ---------------------------------------------------- | ----------------------------------------------- |
| `FileReferences.Moc`         | 模型网格数据，由 Cubism Editor 导出，不可手动修改    | —                                               |
| `FileReferences.Textures`    | 贴图文件路径列表                                     | —                                               |
| `FileReferences.Physics`     | 物理效果配置，定义头发、衣物的摆动规律               | —                                               |
| `FileReferences.Expressions` | 表情列表，每项包含名称（`Name`）和文件路径（`File`） | `l2d.getExpressions()` / `l2d.setExpression()`  |
| `FileReferences.Motions`     | 动作分组字典，键为分组名，值为该组所有动作           | `l2d.getMotions()` / `l2d.playMotion()`         |
| `Motions[].Sound`            | 动作关联的声音文件，播放该动作时同步播放             | `l2d.load({ volume })` / `l2d.setVolume()`      |
| `Groups`                     | 参数组定义，如眨眼参数组、口型同步参数组             | `l2d.setParams()`                               |
| `HitAreas`                   | 可点击区域，每项有名称和对应的网格 ID                | `l2d.on('tap', ...)` / `l2d.getHitAreaBounds()` |

### 动作文件（.motion3.json）

动作文件记录了模型各参数随时间变化的曲线数据：

```json
{
  "Version": 3,
  "Meta": {
    "Duration": 3.5,
    "Fps": 30,
    "Loop": true
  },
  "Curves": [
    {
      "Target": "Parameter",
      "Id": "ParamAngleX",
      "Segments": [0.0, 0.0, 3.5, 15.0]
    }
  ]
}
```

| 字段            | 说明                                                      |
| --------------- | --------------------------------------------------------- |
| `Meta.Duration` | 动作时长（秒），对应 `motionstart` 事件的 `duration` 参数 |
| `Meta.Fps`      | 动画帧率                                                  |
| `Meta.Loop`     | 是否循环播放                                              |
| `Curves`        | 各参数随时间的变化曲线，驱动模型运动                      |

### 表情文件（.exp3.json）

表情文件通过设定特定参数的值来改变模型外观：

```json
{
  "Type": "Live2D Expression",
  "Parameters": [
    { "Id": "ParamEyeLOpen", "Value": 0.0, "Blend": "Multiply" },
    { "Id": "ParamEyeROpen", "Value": 0.0, "Blend": "Multiply" },
    { "Id": "ParamMouthForm", "Value": 1.0, "Blend": "Add" }
  ]
}
```

| 字段                 | 说明                                                             |
| -------------------- | ---------------------------------------------------------------- |
| `Parameters[].Id`    | 要控制的参数 ID                                                  |
| `Parameters[].Value` | 目标值                                                           |
| `Parameters[].Blend` | 混合方式：`Overwrite`（覆盖）/ `Add`（叠加）/ `Multiply`（乘法） |

---

## Cubism 2 模型（.model.json）

较早期的模型使用 Cubism 2 格式，目录结构如下：

```
shizuku/
├── shizuku.model.json   ← 入口文件
├── shizuku.moc          ← 模型网格数据
├── shizuku.1024/
│   ├── texture_00.png
│   └── texture_01.png
├── shizuku.physics.json ← 物理效果
├── expressions/
│   └── f01.exp.json     ← 表情文件（Cubism 2 格式）
└── motions/
    ├── idle.mtn         ← 动作文件（Cubism 2 格式）
    └── tap_body.mtn
```

### model.json 结构解析

```json
{
  "version": "Sample 1.0.0",
  "model": "shizuku.moc",
  "textures": ["shizuku.1024/texture_00.png", "shizuku.1024/texture_01.png"],
  "physics": "shizuku.physics.json",
  "expressions": [{ "name": "f01", "file": "expressions/f01.exp.json" }],
  "hit_areas": [
    { "name": "head", "id": "D_REF.HEAD" },
    { "name": "body", "id": "D_REF.BODY" }
  ],
  "motions": {
    "idle": [{ "file": "motions/idle.mtn", "fade_in": 2000, "fade_out": 2000 }],
    "tap_body": [
      { "file": "motions/tap_body.mtn", "sound": "sounds/tap_body.ogg" }
    ]
  }
}
```

Cubism 2 与 Cubism 6 的字段基本对应，区别在于：

- 命名风格为 `snake_case`（小写加下划线）
- 动作文件为 `.mtn` 格式，表情文件为 `.exp.json` 格式
- 时间单位使用毫秒（`fade_in: 2000` 表示 2 秒）

**l2d 屏蔽了两个版本之间的全部差异，对外暴露完全相同的 API 接口。**

---

## 文件类型速查表

| 文件类型 | Cubism 6         | Cubism 2        | l2d 处理方式                                   |
| -------- | ---------------- | --------------- | ---------------------------------------------- |
| 入口配置 | `.model3.json`   | `.model.json`   | 传给 `l2d.load({ path })`                      |
| 模型网格 | `.moc3`          | `.moc`          | 自动加载，无需关心                             |
| 贴图     | `.png`           | `.png`          | 自动加载，无需关心                             |
| 动作     | `.motion3.json`  | `.mtn`          | `l2d.getMotions()` / `l2d.playMotion()`        |
| 表情     | `.exp3.json`     | `.exp.json`     | `l2d.getExpressions()` / `l2d.setExpression()` |
| 物理     | `.physics3.json` | `.physics.json` | 自动加载，无需关心                             |
| 声音     | `.ogg` / `.mp3`  | `.ogg` / `.mp3` | `l2d.load({ volume })` / `l2d.setVolume()`     |

l2d 会根据入口文件中的配置自动加载所有引用的资源文件，你只需要提供入口文件的 URL。
