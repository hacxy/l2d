---
group:
  text: 能力
  sort: 2
---

# 模型加载

模型在加载时，允许传入加载选项，用于定义模型的位置、缩放等属性


<DemoBlock demo="demo1">

<<< ../../demos/index.ts#demo1{ts}

</DemoBlock>

你可以在一个实例中多次调用`load`方法，以重新加载模型或者切换模型。下面这个例子中：加载完黑猫的3秒后自动切换为白猫

<DemoBlock demo="demo3">

<<< ../../demos/index.ts#demo3{ts}

</DemoBlock>

以下是`load`方法中所有可传的选项

<!--@include: ../../api/interfaces/Options.md-->
