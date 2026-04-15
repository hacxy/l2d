import type { ThemeConfig } from 'vitepress-theme-mild';
import { defineConfigWithTheme } from 'vitepress';
import baseConfig from 'vitepress-theme-mild/config';
import pkgInfo from '../../package.json';

// https://vitepress.dev/reference/site-config
export default defineConfigWithTheme<ThemeConfig>({
  title: 'L2D',
  description: 'L2D documentation',
  extends: baseConfig,
  ignoreDeadLinks: true,
  themeConfig: {
    outline: [2, 3],
    // https://vitepress.dev/reference/default-theme-config
    logo: '/logo.svg',
    nav: [
      { text: '指南', link: '/guide/intro/', activeMatch: '/guide/' },
      { text: '参考', link: '/reference/', activeMatch: '/reference/' },
      { text: 'Demos', link: 'https://l2d-demo.hacxy.cn' },
      // { text: '参考', link: '/api/interfaces/Options.md' , activeMatch: '/api/'},
      { text: pkgInfo.version, items: [
        {
          text: '更新日志',
          link: 'https://github.com/hacxy/l2d/releases'
        }
      ] }
    ],
    sidebar: {
      '/reference/': 'auto',
      '/guide/': 'auto',
    },
    footer: {
      message: 'MIT Licensed',
      copyright: 'Copyright © 2024-Present <a href="https://github.com/hacxy">Hacxy</a>',
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/hacxy/l2d' }
    ]
  }
});
