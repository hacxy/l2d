<script lang="ts" setup>
import type { L2D, Options } from '../../../../dist';
import { onMounted, ref, shallowRef, toRefs } from 'vue';

const props = defineProps<Partial<Options> & {
  width?: number
  height?: number
}>();

const emit = defineEmits<{
  loadstart: [total: number]
  loadprogress: [loaded: number, total: number, file: string]
  loaded: []
}>();

const { path, width, height } = toRefs(props);

const l2d = shallowRef<L2D | null>(null);

const l2dCanvas = ref<HTMLCanvasElement | null>(null);

onMounted(() => {
  if (!path?.value)
    return;
  import('../../../../dist').then(({ init }) => {
    l2d.value = init(l2dCanvas.value! as HTMLCanvasElement);
    l2d.value.on('loadstart', total => emit('loadstart', total));
    l2d.value.on('loadprogress', (loaded, total, file) => emit('loadprogress', loaded, total, file));
    l2d.value.on('loaded', () => emit('loaded'));
    l2d.value.load({ path: path.value! });
  });
});

defineExpose({ l2d, l2dCanvas });
</script>

<template>
  <canvas ref="l2dCanvas" :width="width" :height="height" />
</template>
