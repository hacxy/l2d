---
group:
  text: 动作&表情
  icon: line-md:emoji-grin
  sort: 3
sidebar:
  icon: line-md:monitor-arrow-down
---

# 预加载策略

在创建模型时, 可以决定模型动作文件的预加载策略, 使某一些或者全部动作文件在模型创建时就预先加载, 这样当需要手动切换动作时, 如果该动作文件已被加载, 则无需再等待该动作的加载过程:

<!--@include: ../../api/enumerations/MotionPreload.md-->

## 示例
- 如果需要定义预加载策略, 可以从`l2d`中导入 `MotionPreload` 枚举值
```ts
import { MotionPreload } from 'l2d';
```

- 默认的预加载策略为: `MotionPreload.IDLE`, 也就是预先加载闲置动作

<<< ../../demos/index.ts#demo8

<DemoModal :demo="demo8"/>

<script setup>
import { demo8 } from '../../demos/index.ts'
</script>