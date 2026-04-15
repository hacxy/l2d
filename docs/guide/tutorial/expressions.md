---
sidebar:
  sort: 3
---

# 表情系统

Live2D 的表情系统独立于动作系统，通过直接设置模型特定参数的值（如眼睛开合度、嘴角弧度）来改变模型的神态。

## 表情与动作的区别

|          | 表情                       | 动作                       |
| -------- | -------------------------- | -------------------------- |
| 控制方式 | 将特定参数设定为某个固定值 | 参数随时间按曲线变化       |
| 持续方式 | 持续保持，直到切换新的表情 | 播放一段时间后自动结束     |
| 是否共存 | 是，表情和动作可同时生效   | 相同优先级的动作会互相打断 |

## 获取所有表情

加载完成后，使用 `getExpressions()` 获取模型所有可用表情的 ID 列表：

```ts
l2d.on("loaded", () => {
  const expressions = l2d.getExpressions();
  console.log(expressions);
  // ["f01", "f02", "f03", "f04"]
});
```

返回值中每个字符串对应 `model3.json` 里 `Expressions[].Name` 字段的值。

## 切换表情

```ts
// 切换到指定表情
l2d.setExpression("f01");

// 省略参数，随机切换到一个表情
l2d.setExpression();
```

## 监听表情事件

使用 `expressionchange` 事件监听表情切换，它在调用 `setExpression()` 后立即触发：

```ts
l2d.on("expressionchange", (id) => {
  console.log(`表情已切换: ${id}`);
  // 在这里更新 UI 状态，例如高亮当前选中的表情按钮
});
```

> 表情与动作不同，没有"结束"的概念。表情设置后会永久保持，直到下次 `setExpression()` 调用。因此只有 `expressionchange` 这一个事件。

## 构建一个表情选择器

下面是一个简单的表情切换 UI 示例：

```ts
l2d.on("loaded", () => {
  const expressions = l2d.getExpressions();
  const container = document.getElementById("expression-buttons");

  expressions.forEach((id) => {
    const btn = document.createElement("button");
    btn.textContent = id;
    btn.onclick = () => l2d.setExpression(id);
    container.appendChild(btn);
  });
});
```

## 表情文件结构回顾

表情文件（`.exp3.json`）的本质是一组参数的目标值定义：

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

`Blend` 决定参数值的混合方式：

| Blend 值    | 说明                     |
| ----------- | ------------------------ |
| `Overwrite` | 直接覆盖为 `Value`       |
| `Add`       | 在当前值基础上加 `Value` |
| `Multiply`  | 将当前值乘以 `Value`     |

参考[方法](../../reference/method.md)，以查阅所有的模型方法