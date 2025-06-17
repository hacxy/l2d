import type { Theme } from 'vitepress';
import { Icon } from '@iconify/vue';
import MildTheme from 'vitepress-theme-mild';
import Demo from './components/Demo.vue';
import DemoModal from './components/DemoModal.vue';
import Layout from './components/Layout.vue';
import Live2D from './components/Live2D.vue';

export default {
  extends: MildTheme,
  Layout,
  enhanceApp(ctx) {
    ctx.app.component('Live2D', Live2D);
    ctx.app.component('Demo', Demo);
    ctx.app.component('DemoModal', DemoModal);
    ctx.app.component('Icon', Icon);
  },
} satisfies Theme;
