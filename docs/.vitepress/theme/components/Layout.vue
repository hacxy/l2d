<script lang="ts" setup>
import MildTheme from 'vitepress-theme-mild';
import { ref } from 'vue';
import Live2D from './Live2D.vue';

const { Layout } = MildTheme;
const path = ref('https://model.hacxy.cn/HK416-2-destroy/model.json');
</script>

<template>
  <Layout>
    <template #home-hero-image>
      <Live2D :path="path" :scale="0.07" />
    </template>
  </Layout>
</template>
