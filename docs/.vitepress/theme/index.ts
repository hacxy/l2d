import type { Theme } from 'vitepress';
import MildTheme from 'vitepress-theme-mild';
import Layout from './components/Layout.vue';

// export default MildTheme;

export default {
  extends: MildTheme,
  Layout,
  // enhanceApp(ctx) {
  //   // MildTheme?.enhanceApp?.(ctx);
  // }
} satisfies Theme;
