---
sidebar:
  sort: 4
---

# 模型事件

l2d 提供了一套完整的事件系统，覆盖模型生命周期的每个阶段以及用户交互。所有事件都通过 `l2d.on(event, listener)` 注册监听。

## 生命周期事件

以下是模型从加载到销毁的完整流程：

<img src="/lifecycle.svg" alt="L2D 生命周期" style="max-width:400px;display:block;margin:24px auto"/>


参考: [事件](../../reference/event.md) 以查阅所有可监听的模型事件

### loadstart

```ts
l2d.on("loadstart", (total: number) => {
  console.log(`开始加载，共 ${total} 个文件`);
});
```

### loadprogress

```ts
l2d.on("loadprogress", (loaded: number, total: number, file: string) => {
  const percent = Math.round((loaded / total) * 100);
  console.log(`${percent}% — ${file}`);
});
```

### loaded

`loaded` 是最常用的事件，表示模型已完全就绪，可以安全地调用 `getMotions()`、`getExpressions()` 等方法：

```ts
l2d.on("loaded", () => {
  console.log("模型已就绪");
  const motions = l2d.getMotions();
  const expressions = l2d.getExpressions();
});
```

### destroy

```ts
l2d.on("destroy", () => {
  console.log("模型已销毁，WebGL 资源已释放");
});
```

---

## 交互事件

### tap

用户点击 canvas 且命中某个 Hit Area 时触发。Hit Area 是模型作者在 `model3.json` 中定义的可交互区域（如头部、身体等）：

```ts
l2d.on("tap", (areaName: string) => {
  console.log(`点击了: ${areaName}`); // 例如 "Head"、"Body"
});
```

根据点击区域触发不同动作是最常见的交互模式：

```ts
l2d.on("tap", (areaName) => {
  switch (areaName) {
    case "Body":
      l2d.playMotion("TapBody", undefined, 3);
      break;
    case "Head":
      l2d.playMotion("TapHead", undefined, 3);
      break;
  }
});
```

> `tap` 事件只在点击命中 Hit Area 时触发，点击模型轮廓之外或未定义 Hit Area 的区域不会触发。如需可视化查看 Hit Area 的范围，参见进阶篇[可视化点击区域](./hit-area-visualization)。

---

## 动作事件

### motionstart

```ts
l2d.on(
  "motionstart",
  (group: string, index: number, duration: number, file: string | null) => {
    console.log(
      `动作开始: ${group}[${index}]，时长: ${duration > 0 ? duration + "s" : "未知"}`,
    );
  },
);
```

### motionend

```ts
l2d.on("motionend", (group: string, index: number, file: string | null) => {
  console.log(`动作结束: ${group}[${index}]`);
});
```

---

## 表情事件

### expressionchange

```ts
l2d.on("expressionchange", (id: string) => {
  console.log(`表情切换: ${id}`);
});
```

表情与动作不同，没有"结束"的概念——表情一旦设置就会永久保持，直到下次调用 `setExpression()` 为止。因此只有 `expressionchange` 这一个事件，在调用 `setExpression()` 后立即触发。

---

## 注意事项

**监听器注册时机**：所有事件监听器应在调用 `l2d.load()` 之前完成注册。`load()` 是异步操作，如果在 `load()` 之后注册 `loaded` 监听器，可能已经错过了事件。

```ts
// ✅ 正确：提前注册监听器，再调用 load()
l2d.on('loaded', () => { ... })
l2d.load({ path: '...' })

// ❌ 错误：load() 已经完成
await l2d.load({ path: '...' })
l2d.on('loaded', () => { ... }) // 可能永远不会触发
```
