<script lang="ts" setup>
import type { L2D, Options } from '../../../../dist';
import { nextTick, onBeforeUnmount, onMounted, ref, shallowRef, toRefs, watch } from 'vue';

const props = defineProps<Partial<Options> & {
  width?: number
  height?: number
  /** 铺满父容器，按容器尺寸设置 canvas 分辨率并随窗口缩放 */
  fill?: boolean
}>();

const emit = defineEmits<{
  loadstart: [total: number]
  loadprogress: [loaded: number, total: number, file: string]
  loaded: []
}>();

const { path, width, height } = toRefs(props);

const l2d = shallowRef<L2D | null>(null);

const l2dCanvas = ref<HTMLCanvasElement | null>(null);
const wrapRef = ref<HTMLElement | null>(null);

let ro: ResizeObserver | null = null;

function bindL2dEvents(instance: L2D) {
  instance.on('loadstart', total => emit('loadstart', total));
  instance.on('loadprogress', (loaded, total, file) => emit('loadprogress', loaded, total, file));
  instance.on('loaded', () => emit('loaded'));
}

function syncCanvasSize() {
  if (!props.fill)
    return;
  const canvas = l2dCanvas.value;
  const wrap = wrapRef.value;
  if (!canvas || !wrap)
    return;
  const dpr = window.devicePixelRatio || 1;
  const cssW = wrap.clientWidth;
  const cssH = wrap.clientHeight;
  if (cssW < 1 || cssH < 1)
    return;
  const w = Math.max(1, Math.floor(cssW * dpr));
  const h = Math.max(1, Math.floor(cssH * dpr));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  l2d.value?.resize();
}

onMounted(async () => {
  if (!props.fill)
    return;
  await nextTick();
  if (!wrapRef.value)
    return;
  ro = new ResizeObserver(() => syncCanvasSize());
  ro.observe(wrapRef.value);
  syncCanvasSize();
});

onBeforeUnmount(() => {
  ro?.disconnect();
  ro = null;
});

watch(
  [path, l2dCanvas],
  async ([p, el]) => {
    if (!p || !el)
      return;
    if (!l2d.value) {
      const { init } = await import('../../../../dist');
      l2d.value = init(el as HTMLCanvasElement);
      bindL2dEvents(l2d.value);
    }
    if (props.fill) {
      await nextTick();
      syncCanvasSize();
    }
    l2d.value.load({ path: p });
  },
  { immediate: true, flush: 'post' },
);

defineExpose({ l2d, l2dCanvas });
</script>

<template>
  <div v-if="fill" ref="wrapRef" class="live2d-fill">
    <canvas ref="l2dCanvas" />
  </div>
  <canvas v-else ref="l2dCanvas" :width="width" :height="height" />
</template>

<style scoped>
.live2d-fill {
  width: 100%;
  height: 100%;
  min-height: 0;
  min-width: 0;
}
</style>
