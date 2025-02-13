import type { Theme } from 'vitepress';
import MildTheme from 'vitepress-theme-mild';
import Layout from './components/Layout.vue';

export default {
  extends: MildTheme,
  Layout,
} satisfies Theme;
