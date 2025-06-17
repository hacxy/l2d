---
sidebar:
  icon: line-md:emoji-neutral
  sort: 5

---

# 口型动作同步

口型动作同步功能需要模型仅支持 `motionsync3`, 在使用此功能之前, 请检查模型是否存在 `motionsync3.json` 文件. 或者你还可以使用 live2d 官方为演示口型同步所提供的示例模型: [kei_vowels_pro](https://model.hacxy.cn/kei_vowels_pro/)

## 使用AudioBuffer

可以将 `AudioBuffer` 作为参数, 之后调用 `speak` 方法, 就可以实现模型的口型动作同步, 你可以借助一个tts服务将一段文本转为 `AudioBuffer`.

在这个例子中, 点击*说话按钮*, 可让模型播放说出输入框的内容

示例代码:

<<< ../../demos/index.ts#demo4

<DemoModal :demo="demo4" width="100%" :style="{marginBottom: '90px'}"/>

<script setup>
import { demo4 } from '../../demos/index.ts'
</script>

## 使用媒体流

待补充...

<!-- <DemoModal/> -->
