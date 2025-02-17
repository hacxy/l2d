# 可点击区域

现在你可以非常快速的找到模型的可点击区域, 调用 `showHitAreaFrames` 方法将显示可点击区域, 调用`hideHitAreaFrames` 方法则隐藏, 以下是使用checkbox切换显示可点击区域的完整例子:

<<< ../../demos/index.ts#demo3{13,16 ts:line-numbers}

<Demo :demo="demo3" :style="{marginBottom: '50px'}"/>

当鼠标 `hover` 到这些区域时, 会显示区域名称, 如果你监听了 [hit 事件](./event.md#hit), 这个名称可以在这个事件的回调中获取

<script setup>
import { demo3 } from '../../demos/index.ts'
</script>
