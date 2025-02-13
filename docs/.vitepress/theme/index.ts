import type { Theme } from 'vitepress';
import MildTheme from 'vitepress-theme-mild';
import Layout from './components/Layout.vue';
import Live2D from './components/Live2D.vue';

export default {
  extends: MildTheme,
  Layout,
  enhanceApp(ctx) {
    ctx.app.component('Live2D', Live2D);
  },
} satisfies Theme;
