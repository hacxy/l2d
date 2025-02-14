# 模型实例

创建模型将返回一个实例, 用于方便后续操作模型的样式和行为

```ts
import { init } from 'l2d';
const l2d = init(document.getElementById('l2d') as HTMLCanvasElement);

async function main() {
  const model = await l2d.create({
    path: ''
  });
}
```

<!--@include: ../api/classes/Model.md-->
