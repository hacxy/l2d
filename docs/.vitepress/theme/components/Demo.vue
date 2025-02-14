<script lang="ts" setup>
import { onMounted, ref } from 'vue';

const { demo, width, height } = defineProps<{
  demo: (init, l2dCanvas) => Promise<void>
  width?: number
  height?: number
}>();

const l2dCanvas = ref(null);

onMounted(() => {
  import('../../../../dist').then(({ init }) => {
    demo(init, l2dCanvas);
  });
});
</script>

<template>
  <div :style="{ width: `${width ?? 300}px`, height: `${height ?? 300}px` }">
    <canvas ref="l2dCanvas" />
  </div>
</template>
