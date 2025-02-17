# 模型事件

通过模型实例的 `on` 方法来监听模型事件.

## 事件列表

以下列出了所有的模型事件列表, `key` 为事件名, `type` 则为事件触发回调时携带的数据类型, 以 `hit` 为例:

```ts
const l2d = init(document.getElementById('l2d') as HTMLCanvasElement);
const model = await l2d.create({
  path: 'https://model.hacxy.cn/shizuku/shizuku.model.json',
});

model.on('hit', areas => {
  // 可点击区域被点击, areas为当前模型被点击的区域名称, 类型为: string[]
});
```

<!--@include: ../../api/interfaces/Emits.md-->
