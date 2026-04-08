import type { Theme } from 'vitepress';
import { Icon } from '@iconify/vue';
import MildTheme from 'vitepress-theme-mild';
import DemoBlock from './components/DemoBlock.vue';
import Layout from './components/Layout.vue';
import Live2D from './components/Live2D.vue';

export default {
  extends: MildTheme,
  Layout,
  enhanceApp(ctx) {
    ctx.app.component('Live2D', Live2D);
    ctx.app.component('Icon', Icon);
    ctx.app.component('DemoBlock', DemoBlock);
  },
} satisfies Theme;
