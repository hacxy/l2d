<script lang="ts" setup>
import { NList, NListItem, NSpin, NTag, NText } from 'naive-ui';
import { useModelStore } from '../composables/useModelStore';

const { models, loading, error } = useModelStore();
</script>

<template>
  <div class="model-gallery">
    <div v-if="loading" class="model-gallery__loading">
      <NSpin />
      <NText depth="3">
        正在获取模型列表...
      </NText>
    </div>

    <NText v-else-if="error" type="error">
      {{ error }}
    </NText>

    <template v-else>
      <NText depth="3" class="model-gallery__count">
        共 {{ models.length }} 个模型
      </NText>
      <NList bordered>
        <NListItem v-for="model in models" :key="model.dir">
          <div class="model-item">
            <div class="model-item__name">
              {{ model.dir }}
            </div>
            <div class="model-item__meta">
              <NText depth="3" class="model-item__path">
                {{ model.path }}
              </NText>
              <NTag :type="model.version === 5 ? 'info' : 'success'" size="small">
                Cubism {{ model.version === 5 ? '6' : '2' }}
              </NTag>
            </div>
          </div>
        </NListItem>
      </NList>
    </template>
  </div>
</template>

<style scoped>
.model-gallery__loading {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px 0;
}

.model-gallery__count {
  display: block;
  margin-bottom: 12px;
  font-size: 13px;
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
  gap: 8px;
  flex-wrap: wrap;
}

.model-item__path {
  font-size: 12px;
  font-family: 'Courier New', monospace;
  word-break: break-all;
}
</style>
