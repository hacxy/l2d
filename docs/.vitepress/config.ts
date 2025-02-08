import type { ThemeConfig } from 'vitepress-theme-mild';
import { defineConfigWithTheme } from 'vitepress';
import baseConfig from 'vitepress-theme-mild/config';

// https://vitepress.dev/reference/site-config
export default defineConfigWithTheme<ThemeConfig>({
  title: 'L2D',
  description: 'A VitePress Site',
  extends: baseConfig,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: 'logo.svg',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' }
    ],

    sidebar: {
      '/guide/': 'auto'
    },
    footer: {
      message: 'MIT Licensed',
      copyright:
        'Copyright © 2024-Present <a href="https://github.com/hacxy">Hacxy</a>',
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/hacxy/l2d' }
    ]
  }
});
