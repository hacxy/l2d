<script lang="ts" setup>
import type { L2D } from '../../../../dist';
import { createDiscreteApi, darkTheme, NButton, NConfigProvider, NModal, NProgress, NText } from 'naive-ui';
import { useData } from 'vitepress';
import { computed, onBeforeUnmount, ref, shallowRef } from 'vue';
import * as demos from '../../../demos/index';
import Live2D from './Live2D.vue';

const props = defineProps<{
  demo: string
}>();

const { isDark } = useData();
const naiveTheme = computed(() => isDark.value ? darkTheme : null);

const configProviderProps = computed(() => ({ theme: naiveTheme.value }));
const { message } = createDiscreteApi(['message'], { configProviderProps });

const show = ref(false);
const loadedCount = ref(0);
const totalCount = ref(0);
const currentFile = ref('');
const cleanup = shallowRef<(() => void) | null>(null);
const l2dInstance = shallowRef<L2D | null>(null);

const live2dRef = ref<InstanceType<typeof Live2D> | null>(null);
const canvasRef = computed(() => live2dRef.value?.l2dCanvas ?? null);
const progress = ref(0);
const isLoading = ref(false);

function resetProgress() {
  loadedCount.value = 0;
  totalCount.value = 0;
  currentFile.value = '';
  progress.value = 0;
  isLoading.value = false;
}

async function runDemo() {
  resetProgress();
  const { init } = await import('../../../../dist');

  const wrappedInit = (canvas: HTMLCanvasElement): L2D => {
    const l2d = init(canvas);
    l2dInstance.value = l2d;
    isLoading.value = true;
    const MIN_LOADING_MS = 400;
    let loadStartTime = Date.now();
    l2d.on('loadstart', (total: number) => {
      isLoading.value = true;
      progress.value = 0;
      totalCount.value = total;
      loadStartTime = Date.now();
    });
    l2d.on('loadprogress', (loaded, total, file) => {
      loadedCount.value = loaded;
      totalCount.value = total;
      progress.value = total > 0 ? Math.round((loaded / total) * 100) : 0;
      currentFile.value = file.split('/').pop() || file;
    });
    l2d.on('loaded', () => {
      progress.value = 100;
      const elapsed = Date.now() - loadStartTime;
      const remaining = MIN_LOADING_MS - elapsed;
      setTimeout(() => {
        isLoading.value = false;
      }, Math.max(0, remaining));
    });
    return l2d;
  };

  const fn = (demos as Record<string, (...args: unknown[]) => unknown>)[props.demo];
  if (!fn)
    return;

  const result = await fn(wrappedInit, canvasRef, message);
  const onClose = result !== null && typeof result === 'object' && 'onClose' in result && typeof result.onClose === 'function'
    ? (result.onClose as () => void)
    : null;
  cleanup.value = onClose;
}

function onOpen() {
  runDemo();
}

function onClose() {
  cleanup.value?.();
  cleanup.value = null;
  l2dInstance.value?.destroy();
  l2dInstance.value = null;
  resetProgress();
}

onBeforeUnmount(() => {
  cleanup.value?.();
  l2dInstance.value?.destroy();
});
</script>

<template>
  <div class="demo-block">
    <div class="demo-code">
      <slot />
    </div>
    <div class="demo-toolbar">
      <NButton size="small" type="primary" @click="show = true">
        运行
      </NButton>
    </div>

    <NConfigProvider :theme="naiveTheme">
      <NModal
        v-model:show="show"
        class="demo-modal"
        preset="card"
        title="演示"
        style="width: 760px; max-width: 90vw; height: 560px;"
        @after-enter="onOpen"
        @after-leave="onClose"
      >
        <div class="demo-preview">
          <Live2D ref="live2dRef" class="demo-canvas" />
          <Transition name="progress-fade">
            <div v-if="isLoading" class="demo-loading">
              <NProgress
                type="line"
                :percentage="progress"
                indicator-placement="inside"
                processing
              />
              <NText depth="3" class="demo-loading-file">
                {{ currentFile || '初始化中...' }}
              </NText>
            </div>
          </Transition>
        </div>
      </NModal>
    </NConfigProvider>
  </div>
</template>

<style scoped>
.demo-block {
  margin: 16px 0;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
}

.demo-code :deep(div[class*='language-']) {
  margin: 0 !important;
  border-radius: 0 !important;
}

.demo-toolbar {
  display: flex;
  justify-content: flex-end;
  padding: 8px 12px;
  border-top: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}

.demo-preview {
  position: relative;
  height: 100%;
  border-radius: 4px;
  overflow: hidden;
}

.demo-canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.demo-loading {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  padding: 0 40px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.demo-loading-file {
  font-size: 11px;
  font-family: 'Courier New', monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: rgba(255, 255, 255, 0.65) !important;
}

.demo-block :deep(.n-card__content) {
  flex: 1;
  overflow: hidden;
  padding: 12px !important;
}

.progress-fade-enter-active,
.progress-fade-leave-active {
  transition: opacity 0.3s ease;
}

.progress-fade-enter-from,
.progress-fade-leave-to {
  opacity: 0;
}
</style>

<style>
.demo-modal.n-card {
  display: flex;
  flex-direction: column;
}
</style>
