<script lang="ts" setup>
import MildTheme from 'vitepress-theme-mild';
import { ref } from 'vue';
import Live2D from './Live2D.vue';

const { Layout } = MildTheme;
const path = ref('https://model.hacxy.cn/HK416-2-destroy/model.json');
const loading = ref(false);
function onLoad(status: any) {
  if (status === 'loading') {
    loading.value = true;
  }
  setTimeout(() => {
    if (status === 'done') {
      loading.value = false;
    }
  }, 200);
}
</script>

<template>
  <Layout>
    <template #home-hero-image>
      <Live2D
        class="l2d"
        :class="{ show: !loading }"
        :path="path"
        :width="300"
        :height="300"
        :scale="0.07"
        @load="onLoad"
      />
    </template>
  </Layout>
</template>

<style lang="scss" scoped>
.l2d {
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.5s ease-in-out;
}

.l2d.show {
  opacity: 1;
  visibility: visible;
}
</style>
