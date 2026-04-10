<script lang="ts" setup>
/* eslint-disable max-lines */
import { createDiscreteApi, darkTheme, NButton, NConfigProvider, NList, NListItem, NProgress, NSpin, NTag, NText } from 'naive-ui';
import { useData } from 'vitepress';
import { computed, ref, watch } from 'vue';
import { useModelStore } from '../composables/useModelStore';
import Live2D from './Live2D.vue';

/** 列表 + 预览整体固定高度 */
const GALLERY_ROW_HEIGHT = 480;
const galleryRowHeightCss = `${GALLERY_ROW_HEIGHT}px`;

const { isDark } = useData();
const { models, loading, error } = useModelStore();

const selectedPath = ref('');

const modelLoading = ref(false);
const modelProgress = ref(0);
const modelCurrentFile = ref('');

function onModelLoadStart(total: number) {
  modelLoading.value = true;
  modelProgress.value = 0;
  modelCurrentFile.value = total > 0 ? `共 ${total} 个文件` : '准备加载...';
}

function onModelLoadProgress(loaded: number, total: number, file: string) {
  modelProgress.value = total > 0 ? Math.round((loaded / total) * 100) : 0;
  modelCurrentFile.value = file.split('/').pop() || file;
}

function onModelLoaded() {
  modelProgress.value = 100;
  setTimeout(() => {
    modelLoading.value = false;
  }, 220);
}

watch(selectedPath, p => {
  if (!p)
    modelLoading.value = false;
});

watch(
  models,
  list => {
    if (list.length === 0) {
      selectedPath.value = '';
      return;
    }
    const stillValid = selectedPath.value && list.some(m => m.path === selectedPath.value);
    if (!stillValid)
      selectedPath.value = list[0].path;
  },
  { immediate: true, deep: true },
);

const naiveTheme = computed(() => isDark.value ? darkTheme : null);
const lightThemeOverrides = {
  common: {
    primaryColor: '#3451b2',
    primaryColorHover: '#3a5ccc',
    primaryColorPressed: '#2f4599',
    borderColor: '#e2e2e3',
    textColor1: '#213547',
    textColor2: '#476582',
  },
};

const darkThemeOverrides = {
  common: {
    primaryColor: '#a8b1ff',
    primaryColorHover: '#b8c0ff',
    primaryColorPressed: '#8f99ea',
    borderColor: '#2e2e32',
    textColor1: 'rgba(255, 255, 245, 0.86)',
    textColor2: 'rgba(235, 235, 245, 0.6)',
  },
};

const themeOverrides = computed(() => (isDark.value ? darkThemeOverrides : lightThemeOverrides));

const configProviderProps = computed(() => ({
  ...(naiveTheme.value ? { theme: naiveTheme.value } : {}),
  themeOverrides: themeOverrides.value,
}));
const { message } = createDiscreteApi(['message'], { configProviderProps });

async function copyModelPath(url: string) {
  try {
    await navigator.clipboard.writeText(url);
    message.success('已复制模型地址');
  }
  catch {
    message.error('复制失败，请检查浏览器权限');
  }
}

function selectModel(path: string) {
  selectedPath.value = path;
}
</script>

<template>
  <NConfigProvider :theme="naiveTheme" :theme-overrides="themeOverrides">
    <div class="model-gallery">
      <div v-if="loading" class="model-gallery__loading">
        <NSpin size="large" />
        <div class="model-gallery__loading-detail">
          <NText depth="2">
            正在获取模型列表
          </NText>
          <NText depth="3" class="model-gallery__loading-hint">
            连接模型服务器并扫描目录…
          </NText>
          <NProgress
            type="line"
            :percentage="66"
            processing
            :show-indicator="false"
            class="model-gallery__loading-bar"
          />
        </div>
      </div>

      <NText v-else-if="error" type="error">
        {{ error }}
      </NText>

      <template v-else>
        <NText depth="3" class="model-gallery__count">
          共 {{ models.length }} 个模型，点击切换预览
        </NText>
        <div class="model-gallery__shell">
          <div class="model-gallery__sidebar">
            <div class="model-gallery__list-wrap">
              <NList bordered class="model-gallery__list">
                <NListItem
                  v-for="model in models"
                  :key="model.dir"
                  class="model-gallery__list-item"
                  :class="{ 'model-gallery__list-item--active': model.path === selectedPath }"
                  @click="selectModel(model.path)"
                >
                  <div class="model-item">
                    <div class="model-item__name">
                      {{ model.dir }}
                    </div>
                    <div class="model-item__meta">
                      <NTag :type="model.version === 6 ? 'info' : 'success'" size="small">
                        Cubism {{ model.version === 6 ? '6' : '2' }}
                      </NTag>
                      <div class="model-item__copy-row">
                        <span
                          class="model-item__copy-label"
                          @click.stop="copyModelPath(model.path)"
                        >
                          <NText depth="3">
                            复制地址
                          </NText>
                        </span>
                        <NButton
                          quaternary
                          circle
                          size="tiny"
                          class="model-item__copy"
                          aria-label="复制模型地址"
                          @click.stop="copyModelPath(model.path)"
                        >
                          <template #icon>
                            <Icon icon="mdi:content-copy" />
                          </template>
                        </NButton>
                      </div>
                    </div>
                  </div>
                </NListItem>
              </NList>
            </div>
          </div>

          <div class="model-gallery__preview">
            <Live2D
              v-if="selectedPath"
              fill
              :path="selectedPath"
              @loadstart="onModelLoadStart"
              @loadprogress="onModelLoadProgress"
              @loaded="onModelLoaded"
            />
            <div v-else class="model-gallery__preview-empty">
              <NText depth="3">
                暂无可用模型
              </NText>
            </div>
            <Transition name="model-gallery-fade">
              <div
                v-if="selectedPath && modelLoading"
                class="model-gallery__model-loading"
              >
                <NProgress
                  type="line"
                  :percentage="modelProgress"
                  indicator-placement="inside"
                  processing
                />
                <NText depth="3" class="model-gallery__model-loading-file">
                  {{ modelCurrentFile }}
                </NText>
              </div>
            </Transition>
          </div>
        </div>
      </template>
    </div>
  </NConfigProvider>
</template>

<style scoped>
.model-gallery__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  min-height: v-bind(galleryRowHeightCss);
  padding: 24px;
  box-sizing: border-box;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
}

.model-gallery__loading-detail {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
  max-width: 320px;
  text-align: center;
}

.model-gallery__loading-hint {
  font-size: 13px;
}

.model-gallery__loading-bar {
  width: 100%;
  margin-top: 4px;
}

.model-gallery__count {
  display: block;
  margin-bottom: 10px;
  font-size: 13px;
}

.model-gallery__shell {
  display: flex;
  align-items: stretch;
  align-content: stretch;
  flex-wrap: wrap;
  gap: 0;
  height: v-bind(galleryRowHeightCss);
  box-sizing: border-box;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  background: var(--vp-c-bg);
}

.model-gallery__sidebar {
  flex: 0 1 220px;
  max-width: 220px;
  min-width: 0;
  min-height: 0;
  align-self: stretch;
  display: flex;
  flex-direction: column;
}

.model-gallery__list-wrap {
  flex: 1 1 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  overflow-y: auto;
  background: var(--vp-c-bg);
}

.model-gallery__list {
  border-radius: 0;
  box-sizing: border-box;
  min-height: 100%;
  margin: 0;
  padding-left: 0;
}

.model-gallery__list-item {
  cursor: pointer;
  transition: background 0.15s ease;
}

.model-gallery__list-item:hover {
  background: var(--vp-c-bg-soft);
}

.model-gallery__list-item--active {
  background: var(--vp-c-bg-soft);
  box-shadow: inset 3px 0 0 0 var(--vp-c-brand-1);
}

.model-gallery__preview {
  position: relative;
  flex: 1 1 0;
  min-width: 0;
  min-height: 0;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  border-left: 1px solid var(--vp-c-divider);
  background: transparent;
}

.model-gallery__model-loading {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  padding: 0 20px;
  background: color-mix(in srgb, var(--vp-c-bg) 82%, transparent);
  backdrop-filter: blur(6px);
}

.model-gallery__model-loading-file {
  font-size: 12px;
  font-family: 'Courier New', monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: center;
}

.model-gallery-fade-enter-active,
.model-gallery-fade-leave-active {
  transition: opacity 0.25s ease;
}

.model-gallery-fade-enter-from,
.model-gallery-fade-leave-to {
  opacity: 0;
}

.model-gallery__preview :deep(.live2d-fill) {
  flex: 1 1 0;
  min-width: 0;
  min-height: 0;
  width: 100%;
  height: 100%;
}

.model-gallery__preview :deep(canvas) {
  display: block;
  background: transparent;
}

.model-gallery__preview-empty {
  flex: 1 1 0;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

@media (max-width: 640px) {
  .model-gallery__shell {
    height: auto;
    min-height: v-bind(galleryRowHeightCss);
  }

  .model-gallery__preview {
    border-left: none;
    border-top: 1px solid var(--vp-c-divider);
    flex: 1 1 100%;
    min-height: 200px;
  }

  .model-gallery__sidebar {
    flex: 1 1 100%;
    width: 100%;
    max-width: none;
  }
}

.model-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.model-item__name {
  font-weight: 500;
}

.model-item__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.model-item__copy-row {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}

.model-item__copy-label {
  font-size: 12px;
  cursor: pointer;
  user-select: none;
}

.model-item__copy {
  flex-shrink: 0;
}
</style>
