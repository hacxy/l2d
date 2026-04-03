<script lang="ts" setup>
import MildTheme from 'vitepress-theme-mild';
import { ref } from 'vue';
import Live2D from './Live2D.vue';

const { Layout } = MildTheme;
const path = ref('https://model.hacxy.cn/HK416-2-destroy/model.json');

const width = ref(300);
const height = ref(300);
</script>

<template>
  <Layout>
    <template #home-hero-image>
      <Live2D
        class="l2d"
        :path="path"
        :width="width"
        :height="height"
      />
    </template>
  </Layout>
</template>

<style lang="scss" scoped>
</style>
