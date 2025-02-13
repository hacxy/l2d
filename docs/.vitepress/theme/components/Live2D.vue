<script lang="ts" setup>
// eslint-disable-next-line antfu/no-import-dist
import type { L2D, Model, Options } from '../../../../dist';
import { nextTick, onMounted, ref, toRefs, watch } from 'vue';

const props = defineProps<Options & {
  width?: number
  height?: number
}>();

const emits = defineEmits<{
  (e: 'load', status: 'loading' | 'done'): void
}>();
const { path, position, scale, volume, anchor, rotaion, width, height } = toRefs(props);

let l2d: L2D;
let model: Model;

const l2dCanvas = ref(null);

watch(path, reloadModel);
watch(scale, () => model.setScale(scale.value || 'auto'));
watch(volume, () => model.setVolume(volume.value));
watch(anchor, () => model.setAnchor(...(anchor.value || [])));
watch(rotaion, () => model.setRotaion(rotaion.value));
watch(() => position, () => model.setPosition(position.value || 'center'), { deep: true });
watch(() => [width, height], () => {
  nextTick(() => {
    model.setScale(scale.value || 'auto');
    model.setPosition(position.value || 'center');
  });
}, { deep: true });

async function reloadModel() {
  model?.destroy();

  emits('load', 'loading');

  model = await l2d.create({
    path: path.value,
    scale: scale.value,
    position: position.value,
    volume: volume.value,
    rotaion: rotaion.value,
    anchor: anchor.value
  });
  emits('load', 'done');
}

onMounted(() => {
  import('../../../../dist').then(({ init }) => {
    l2d = init(l2dCanvas.value! as HTMLCanvasElement);
    reloadModel();
  });
});
</script>

<template>
  <div :style="{ width: `${width}px`, height: `${height}px` }">
    <canvas ref="l2dCanvas" />
  </div>
</template>
