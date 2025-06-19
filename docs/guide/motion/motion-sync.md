---
sidebar:
  icon: line-md:emoji-neutral
  sort: 5

---

# 口型动作同步

口型动作同步功能需要模型仅支持 `motionsync3`, 在使用此功能之前, 请检查模型是否存在 `motionsync3.json` 文件. 或者你还可以使用 live2d 官方为演示口型同步所提供的示例模型: [kei_vowels_pro](https://model.hacxy.cn/kei_vowels_pro/kei_vowels_pro.model3.json)

## 使用AudioBuffer

可以将 `AudioBuffer` 作为参数, 之后调用 `speak` 方法, 就可以实现模型的口型动作同步, 你可以借助一个tts服务将一段文本转为 `AudioBuffer`.

在调用说话方法之前,需要先手动加载该模型的 `motionsync3` 文件:

```ts
model.loadMotionSyncFromUrl('https://model.hacxy.cn/kei_vowels_pro/kei_vowels_pro.motionsync3.json');
```

在这个例子中, 点击*说话按钮*, 让该模型说出输入框的内容

示例代码:

<<< ../../demos/index.ts#demo4{34,38}

<DemoModal :demo="demo4" width="100%" :style="{marginBottom: '90px'}"/>


## 使用媒体流

在下面这个例子中, 通过调用麦克风权限, 并通过人声来播放口型动作同步

<<< ../../demos/index.ts#demo9{6,12}

:::tip
点击运行时, 将在你的浏览器中申请麦克风权限, 如果申请得到允许, 你可以尝试对麦克风说些什么, 点击停止说话, 将会关闭麦克风权限, 同时重置口型动作
:::

<DemoModal :demo="demo9" width="100%" :style="{marginBottom: '90px'}"/>

<!-- <DemoModal/> -->

<script setup>
import { demo4 , demo9} from '../../demos/index.ts'
</script>