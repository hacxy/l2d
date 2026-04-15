---
group: 
  text: 指引
  sort: 2
sidebar:
  sort: 1
---
# 控制模型外观

模型加载后，可以通过 `scale`（缩放）和 `position`（位置）来调整模型在画布上的显示效果。这两个选项既可以在 `load()` 时一次性指定，也可以在加载完成后动态修改。

## 缩放（scale）

`scale` 控制模型相对于画布的大小比例，默认值为 `1`。

**在加载时指定：**

```ts
l2d.load({
  path: "https://model.hacxy.cn/Haru/Haru.model3.json",
  scale: 0.8, // 缩小到 80%
});
```

**加载后动态调整：**

```ts
l2d.on("loaded", () => {
  l2d.setScale(1.2); // 放大到 120%
});
```

> `scale` 以模型恰好填满画布高度时为基准（约等于 `1`）。常见调整范围为 `0.5 ~ 2.5`，具体数值需根据模型和画布的实际尺寸来决定。

## 位置偏移（position）

`position` 控制模型中心点相对于画布中心的偏移量，格式为 `[x, y]`。

- `x`：正值向右，负值向左
- `y`：正值向上，负值向下
- 通常范围为 `-2 ~ 2`，单位为模型空间单位（不是像素）

**在加载时指定：**

```ts
l2d.load({
  path: "https://model.hacxy.cn/Haru/Haru.model3.json",
  position: [0, -0.3], // 模型向下偏移 0.3 个单位
});
```

**加载后动态调整：**

```ts
l2d.setPosition(0.5, 0); // 模型向右偏移 0.5 个单位
```

## 同时设置缩放与位置

```ts
l2d.load({
  path: "https://model.hacxy.cn/Haru/Haru.model3.json",
  scale: 1.1,
  position: [0, -0.2],
});
```

## 实际调试技巧

手动调整 `scale` 和 `position` 的数值往往需要反复试验。推荐使用 [l2d-viewer](https://l2d-viewer.hacxy.cn) 在线调试工具：

1. 在工具中加载你的模型
2. 用鼠标拖拽调整模型位置，用滑块调整缩放
3. 工具会实时生成对应的代码，直接复制到你的项目中即可


参考：[选项](../../reference/index.md)，以查阅所有模型加载选项