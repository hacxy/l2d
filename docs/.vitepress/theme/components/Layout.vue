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
const path = ref('chaijun_3/chaijun_3.model3.json');
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
    document.body.classList.remove('nav-scrolled', 'features-visible');
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
  document.body.classList.remove('home-live2d', 'nav-scrolled', 'features-visible');
});

function onLoadStart(total: number) {
  totalCount.value = total;
}

function onLoadProgress(loaded: number, total: number, file: string) {
  loadedCount.value = loaded;
  totalCount.value = total;
  currentFile.value = file.split('/').pop() || file;
}

function onLoaded() {
  hasLoaded.value = true;
  const l2d = live2dRef.value?.l2d;
  if (!l2d)
    return;

  let featuresShown = false;
  l2d.on('motionend', () => {
    if (featuresShown)
      return;
    featuresShown = true;
    document.body.classList.add('features-visible');
  });
  l2d.playMotionByFile('motions/login.motion3');
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
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
}

@media (min-width: 960px) {
  .home-live2d .VPHome {
    display: flex;
    flex-direction: row;
    align-items: center;
    min-height: calc(100vh - var(--vp-nav-height));
    margin-bottom: 0 !important;
  }

  .home-live2d .VPHomeHero {
    flex: 0 0 40%;
    max-width: 40%;
  }

  .home-live2d .VPHomeHero .main {
    width: 100% !important;
    max-width: 100% !important;
  }

  .home-live2d .VPHomeFeatures {
    flex: 0 0 40%;
    max-width: 35%;
    padding: 0 32px !important;
    align-self: center;
    margin-left: auto !important;
  }

  .home-live2d .VPHomeFeatures .item {
    width: 100% !important;
  }
}

.home-live2d .VPHomeFeatures {
  opacity: 0;
  pointer-events: none;
}

.home-live2d.features-visible .VPHomeFeatures {
  opacity: 1;
  pointer-events: auto;
}

.home-live2d .VPFeature {
  opacity: 0;
  transform: translateY(20px);
  transition:
    opacity 0.6s ease,
    transform 0.6s ease;
}

.home-live2d.features-visible .VPFeature:nth-child(1) {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 0s;
}
.home-live2d.features-visible .VPFeature:nth-child(2) {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 0.1s;
}
.home-live2d.features-visible .VPFeature:nth-child(3) {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 0.2s;
}

.home-live2d .VPFeature {
  background-color: rgba(255, 255, 255, 0.65) !important;
  border-color: rgba(255, 255, 255, 0.4) !important;
  backdrop-filter: blur(6px) !important;
  -webkit-backdrop-filter: blur(6px) !important;
}

html.dark .home-live2d .VPFeature {
  background-color: rgba(20, 20, 20, 0.55) !important;
  border-color: rgba(255, 255, 255, 0.08) !important;
}

.home-live2d .VPNavBar {
  background-color: transparent !important;
  box-shadow: none !important;
  border-bottom: none !important;
  transition:
    background-color 0.3s ease,
    backdrop-filter 0.3s ease,
    -webkit-backdrop-filter 0.3s ease !important;
}

@media (min-width: 960px) {
  .home-live2d .VPNavBar .content-body {
    background-color: transparent !important;
  }
}

.home-live2d.nav-scrolled .VPNavBar {
  background-color: rgba(255, 255, 255, 0.6) !important;
  backdrop-filter: blur(6px) !important;
  -webkit-backdrop-filter: blur(6px) !important;
}

html.dark .home-live2d.nav-scrolled .VPNavBar {
  background-color: rgba(0, 0, 0, 0.4) !important;
}

@media (min-width: 960px) {
  .home-live2d.nav-scrolled .VPNavBar .content-body {
    background-color: transparent !important;
  }
}

.home-live2d .VPFooter {
  border-top: none !important;
  box-shadow: none !important;
  background-color: rgba(255, 255, 255, 0.6) !important;
  backdrop-filter: blur(6px) !important;
  -webkit-backdrop-filter: blur(6px) !important;
  transition:
    background-color 0.3s ease,
    backdrop-filter 0.3s ease !important;
}

html.dark .home-live2d .VPFooter {
  background-color: rgba(0, 0, 0, 0.4) !important;
}
</style>
