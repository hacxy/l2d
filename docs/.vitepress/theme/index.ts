import type { Theme } from 'vitepress';
import { Icon } from '@iconify/vue';
import MildTheme from 'vitepress-theme-mild';
import DemoBlock from './components/DemoBlock.vue';
import Layout from './components/Layout.vue';
import Live2D from './components/Live2D.vue';
import ModelGallery from './components/ModelGallery.vue';
import { prefetchModels } from './composables/useModelStore';

export default {
  extends: MildTheme,
  Layout,
  enhanceApp(ctx) {
    if (typeof window !== 'undefined')
      prefetchModels();
    ctx.app.component('Live2D', Live2D);
    ctx.app.component('Icon', Icon);
    ctx.app.component('DemoBlock', DemoBlock);
    ctx.app.component('ModelGallery', ModelGallery);
  },
} satisfies Theme;
