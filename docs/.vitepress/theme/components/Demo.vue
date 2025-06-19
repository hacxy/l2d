<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';

const { demo, width, height, style } = defineProps<{
  demo: (init, l2dCanvas) => Promise<void>
  width?: number | string
  height?: number | string
  style?: any
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
  <div :style="{ width: finalWidth, height: finalHeight, ...style }">
    <canvas ref="l2dCanvas" />
  </div>
</template>

<style>
.say-button {
  margin-left: 10px;
  background: var(--primary-color);
  color: #fff;
  padding: 10px 30px;
  border-radius: 10px;
  font-size: 20px;
}
.say-input {
  padding: 10px;
  margin-top: 20px;
  border-radius: 10px;
  color: #000;
  width: 300px;
}
</style>
