<script lang="ts" setup>
import { useData } from 'vitepress';
import MildTheme from 'vitepress-theme-mild';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import Live2D from './Live2D.vue';
import LoadingOverlay from './LoadingOverlay.vue';

type Live2DInstance = InstanceType<typeof Live2D>;

const { Layout } = MildTheme;
const { frontmatter } = useData();

const isHomePage = computed(() => frontmatter.value.layout === 'home');
const path = ref('abeikelongbi_3/abeikelongbi_3.model3.json');
const live2dRef = ref<Live2DInstance | null>(null);

const hasLoaded = ref(false);
const loadedCount = ref(0);
const totalCount = ref(0);
const currentFile = ref('');
const canvasWidth = ref(0);
const canvasHeight = ref(0);

const progress = computed(() =>
  totalCount.value > 0 ? Math.round((loadedCount.value / totalCount.value) * 100) : 0,
);

function onResize() {
  canvasWidth.value = window.innerWidth;
  canvasHeight.value = window.innerHeight;
}

function onScroll() {
  document.body.classList.toggle('nav-scrolled', window.scrollY > 10);
}

watch(isHomePage, val => {
  document.body.classList.toggle('home-live2d', val);
  if (!val)
    document.body.classList.remove('nav-scrolled');
});

onMounted(() => {
  onResize();
  document.body.classList.toggle('home-live2d', isHomePage.value);
  window.addEventListener('resize', onResize);
  window.addEventListener('scroll', onScroll);
});

onUnmounted(() => {
  window.removeEventListener('resize', onResize);
  window.removeEventListener('scroll', onScroll);
  document.body.classList.remove('home-live2d', 'nav-scrolled');
});

function onLoadStart(total: number) {
  totalCount.value = total;
}

function onLoadProgress(loaded: number, total: number, file: string) {
  console.log('onLoadProgress', loaded, total, file);
  loadedCount.value = loaded;
  totalCount.value = total;
  currentFile.value = file.split('/').pop() || file;
}

function onLoaded() {
  hasLoaded.value = true;
  console.log('l2d instance:', live2dRef.value?.l2d);
  console.log(live2dRef.value?.l2d?.getMotionFiles());
  live2dRef.value?.l2d?.playMotionByFile('motions/login.motion3');
}
</script>

<template>
  <Transition name="fade">
    <LoadingOverlay
      v-if="isHomePage && !hasLoaded"
      :progress="progress"
      :current-file="currentFile"
    />
  </Transition>

  <div v-if="isHomePage" class="l2d-bg">
    <Live2D
      ref="live2dRef"
      :path="path"
      :width="canvasWidth"
      :height="canvasHeight"
      @loadstart="onLoadStart"
      @loadprogress="onLoadProgress"
      @loaded="onLoaded"
    />
  </div>

  <Layout :style="isHomePage && !hasLoaded ? { visibility: 'hidden' } : {}" />
</template>

<style lang="scss" scoped>
.l2d-bg {
  position: fixed;
  inset: 0;
  z-index: 0;

  canvas {
    width: 100%;
    height: 100%;
  }
}

.fade-leave-active {
  transition: opacity 0.6s ease;
}

.fade-leave-to {
  opacity: 0;
}
</style>

<style>
.home-live2d .VPHome {
  background: transparent !important;
}

.home-live2d .VPHero .main {
  visibility: hidden;
}

.home-live2d .VPFeatures {
  display: none;
}

.home-live2d .VPNav {
  background-color: transparent !important;
  box-shadow: none !important;
  transition:
    background-color 0.3s ease,
    backdrop-filter 0.3s ease !important;
}

.home-live2d.nav-scrolled .VPNav {
  background-color: rgba(0, 0, 0, 0.5) !important;
  backdrop-filter: blur(12px) !important;
}
</style>
