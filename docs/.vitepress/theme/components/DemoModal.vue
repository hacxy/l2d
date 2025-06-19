<script lang="ts" setup>
// eslint-disable-next-line antfu/no-import-dist
import type { Model } from '../../../../dist';
import { Icon } from '@iconify/vue';
import { NCard, NModal } from 'naive-ui';
import VPButton from 'vitepress/dist/client/theme-default/components/VPButton.vue';
import { computed, ref, watch } from 'vue';

const {
  demo,
  width,
  height,
  style,
  title = '运行结果',
} = defineProps<{
  demo: (init, l2dCanvas) => Promise<Model>
  width?: number | string
  height?: number | string
  style?: any
  title?: string
}>();

const l2dCanvas = ref(null);
const showModal = ref(false);
const settingsJsonLoaded = ref(false);
const settingsLoaded = ref(false);
const texturesLoaded = ref(false);
const modelLoaded = ref(false);
const closeCallback = ref();
const finalWidth = computed(() => {
  if (!width) return '300px';
  if (typeof width === 'number') {
    return `${width}px`;
  }
  else {
    return width;
  }
});

const finalHeight = computed(() => {
  if (!height) return '300px';
  if (typeof height === 'number') {
    return `${height}px`;
  }
  else {
    return height;
  }
});
const done = computed(() => {
  return (
    settingsJsonLoaded.value
    && settingsLoaded.value
    && texturesLoaded.value
    && modelLoaded.value
  );
});

watch(showModal, () => {
  if (showModal.value) {
    import('../../../../dist').then(({ init }) => {
      demo(init, l2dCanvas).then(model => {
        if ((model as any).onClose) {
          closeCallback.value = (model as any).onClose;
        }
        if (model.on) {
          model.on('settingsJSONLoaded', () => {
            settingsJsonLoaded.value = true;
          });
          model.on('settingsLoaded', () => {
            settingsLoaded.value = true;
          });
          model.on('modelLoaded', () => {
            modelLoaded.value = true;
          });
          model.on('textureLoaded', () => {
            texturesLoaded.value = true;
          });
        }
        else {
          settingsJsonLoaded.value = true;
          settingsLoaded.value = true;
          modelLoaded.value = true;
          texturesLoaded.value = true;
        }
      });
    });
  }
  else {
    closeCallback.value?.();
    setTimeout(() => {
      settingsJsonLoaded.value = false;
      settingsLoaded.value = false;
      texturesLoaded.value = false;
      modelLoaded.value = false;
    }, 300);
  }
});
</script>

<template>
  <VPButton text="点击运行" @click="showModal = true" />
  <NModal v-model:show="showModal" class="docs-modal">
    <NCard
      style="width: 600px"
      :title="title"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
    >
      <div v-show="!done" class="loading-state">
        <div class="loading-state-item">
          <Icon
            :icon="
              settingsJsonLoaded
                ? 'akar-icons:circle-check-fill'
                : 'svg-spinners:6-dots-scale'
            "
            style="font-size: 20px"
          />
          <span>Loading settings json</span>
        </div>
        <div class="loading-state-item">
          <Icon
            :icon="
              settingsLoaded
                ? 'akar-icons:circle-check-fill'
                : 'svg-spinners:6-dots-scale'
            "
            style="font-size: 20px"
          />
          <span>Loading settings</span>
        </div>
        <div class="loading-state-item">
          <Icon
            :icon="
              modelLoaded
                ? 'akar-icons:circle-check-fill'
                : 'svg-spinners:6-dots-scale'
            "
            style="font-size: 20px"
          />
          <span>Loading model</span>
        </div>
        <div class="loading-state-item">
          <Icon
            :icon="
              texturesLoaded
                ? 'akar-icons:circle-check-fill'
                : 'svg-spinners:6-dots-scale'
            "
            style="font-size: 20px"
          />
          <span>Loading textures</span>
        </div>
      </div>
      <div :style="{ height: finalHeight, width: finalWidth, ...style }">
        <canvas ref="l2dCanvas" />
      </div>
    </NCard>
  </NModal>
</template>

<style lang="scss" scoped>
.docs-modal {
  position: relative;
  .loading-state {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
  .loading-state-item {
    display: flex;
  }

  background-color: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  :deep(.n-card-header) {
    .n-card-header__main {
      color: var(--vp-c-text-1);
    }

    .n-card-header__extra {
      color: var(--vp-c-text-1);
    }
  }
}
</style>
