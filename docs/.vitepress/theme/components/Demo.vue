<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';

const { demo, width, height } = defineProps<{
  demo: (init, l2dCanvas) => Promise<void>
  width?: number | string
  height?: number | string
}>();

const l2dCanvas = ref(null);

onMounted(() => {
  import('../../../../dist').then(({ init }) => {
    demo(init, l2dCanvas);
  });
});
const finalWidth = computed(() => {
  if (!width)
    return '300px';
  if (typeof width === 'number') {
    return `${width}px`;
  }
  else {
    return width;
  }
});

const finalHeight = computed(() => {
  if (!height)
    return '300px';
  if (typeof height === 'number') {
    return `${height}px`;
  }
  else {
    return height;
  }
});
</script>

<template>
  <div :style="{ width: finalWidth, height: finalHeight }">
    <canvas ref="l2dCanvas" />
  </div>
</template>
