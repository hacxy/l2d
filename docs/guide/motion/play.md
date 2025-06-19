---
sidebar:
  icon: line-md:cog-filled
  sort: 4
---

# 动作播放

## 获取动作组列表

<<< ../../demos/index.ts#demo10

<DemoModal :demo="demo10"/>

## 根据动作组名称获取动作列表

<<< ../../demos/index.ts#demo11

<DemoModal :demo="demo11"/>

## 播放动作

### 随机播放

接下来我们可以使用上面的方法在1秒钟后从`Tap`动作组中随机播放一个动作:

<<< ../../demos/index.ts#demo12

<DemoModal :demo="demo12"/>

### 指定播放

`playMotion`方法支持在第二个参数传入一个索引值, 来准确指定播放某个动作组的哪一个动作:

<<< ../../demos/index.ts#demo13

<DemoModal :demo="demo13"/>

<script setup>
import { demo10, demo11, demo12, demo13 } from '../../demos/index.ts'
</script>
