<script lang="ts" setup>
// eslint-disable-next-line antfu/no-import-dist
import type { L2D, Options } from '../../../../dist';
import { onMounted, ref, toRefs, watch } from 'vue';

// import { init } from '../../../../dist';

const props = defineProps<Options>();
const emits = defineEmits<{
  (e: 'load', status: 'loading' | 'done'): void
}>();
const { path, x, y, height, width, scale, volume, anchor, rotaion } = toRefs(props);

let l2d: L2D;

const l2dWrapper = ref(null);

watch(path, reloadModel);
watch(() => [width, height], () => l2d.setSize(width.value, height.value), { deep: true });
watch(scale, () => l2d.setScale(scale.value));
watch(volume, () => l2d.setVolume(volume.value));
watch(anchor, () => l2d.setAnchor(...(anchor.value || [])));
watch(rotaion, () => l2d.setRotaion(rotaion.value));
watch(() => [x, y], () => l2d.setPosition(x.value, y.value), { deep: true });

function reloadModel() {
  emits('load', 'loading');
  l2d.loadModel({
    path: path.value,
    scale: scale.value,
    x: x.value,
    y: y.value,
    width: width.value,
    height: height.value,
    volume: volume.value,
    rotaion: rotaion.value,
    anchor: anchor.value
  }).then(() => {
    emits('load', 'done');
  });
}

onMounted(() => {
  import('../../../../dist').then(({ init }) => {
    l2d = init(l2dWrapper.value);
    reloadModel();
  });
});
</script>

<template>
  <div ref="l2dWrapper" />
</template>

