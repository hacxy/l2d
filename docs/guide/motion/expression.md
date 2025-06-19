---
sidebar:
  icon: line-md:emoji-neutral
  sort: 6
---

# 表情

## 获取表情列表

<<< ../../demos/index.ts#demo14

<DemoModal :demo="demo14"/>

## 根据表情id播放表情

仔细观察, 下面这个例子将在两秒钟后由: 愤怒😠 => 微笑😊:

<<< ../../demos/index.ts#demo15

<DemoModal :demo="demo15"/>

<script setup>
import {  demo14, demo15 } from '../../demos/index.ts'
</script>
