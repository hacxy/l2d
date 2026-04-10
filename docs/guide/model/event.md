
# 模型事件

通过模型实例的 `on` 方法来监听模型事件.


## 生命周期

从调用 `load()` 到调用 `destroy()`，模型会经历以下生命周期，每个阶段都有对应的事件可以监听：

<img src="/lifecycle.svg" alt="L2D 生命周期" style="max-width:400px;display:block;margin:24px auto"/>

## 事件列表

以下列出了所有的模型事件列表,  以 `tap` 为例:

<DemoBlock demo="demo2">

<<< ../../demos/index.ts#demo2{ts}

</DemoBlock>

<!--@include: ../../api/interfaces/L2DEventMap.md-->
