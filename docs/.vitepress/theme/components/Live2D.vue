<script lang="ts" setup>
import type { L2D, Options } from '../../../../dist';
import { onMounted, ref, toRefs } from 'vue';

const props = defineProps<Options & {
  width?: number
  height?: number
}>();

const { path, width, height } = toRefs(props);

let l2d: L2D;

const l2dCanvas = ref(null);

onMounted(() => {
  import('../../../../dist').then(({ init }) => {
    l2d = init(l2dCanvas.value! as HTMLCanvasElement);
    l2d.load({
      path: path.value
    }).then(() => {

    });
  });
});
</script>

<template>
  <canvas ref="l2dCanvas" :width="width" :height="height" />
</template>
