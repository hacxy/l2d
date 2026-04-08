---
group:
  text: 指南
  sort: 2
---

# 模型加载

模型在加载时，允许传入选项, 用于定义模型的行为和样式

```ts
const l2d = init(document.getElementById('l2d') as HTMLCanvasElement);
l2d.load({
  // ... 在这里传入加载选项
});
```

加载模型时可以传入以下这些选项:

<!--@include: ../../api/interfaces/Options.md-->
