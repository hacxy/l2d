<script lang="ts" setup>
// eslint-disable-next-line antfu/no-import-dist
import type { L2D, Options } from '../../../../dist';
import { onMounted, ref, toRefs, watch } from 'vue';
// eslint-disable-next-line antfu/no-import-dist
import { init } from '../../../../dist';

const props = defineProps<Options>();
const { path, x, y, height, width, scale } = toRefs(props);
let l2d: L2D;
const l2dWrapper = ref(null);

watch(path, reloadModel);
watch(() => [width.value, height.value], () => l2d.setSize(width.value, height.value), { deep: true });
watch(scale, () => l2d.setScale(scale.value));

function reloadModel() {
  l2d.loadModel({
    path: path.value,
    scale: scale.value,
    x: x.value,
    y: y.value,
    width: width.value,
    height: height.value
  });
}
onMounted(() => {
  l2d = init(l2dWrapper.value);
  reloadModel();
});
</script>

<template>
  <div ref="l2dWrapper" class="l2d" />
</template>

<style scoped>

</style>

