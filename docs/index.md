---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "L2D"
  text: "用于浏览器的Live2D模型加载工具"
  tagline: 将Live2D模型加入至个人网站, 仅需几秒
  actions:
    - theme: brand
      text: Markdown Examplessad
      link: /markdown-examples
    - theme: alt
      text: API Examples
      link: /api-examples

features:
  - title: Feature A
    details: Lorem ipsum dolor sit amet, consectetur adipiscing elit
  - title: Feature B
    details: Lorem ipsum dolor sit amet, consectetur adipiscing elit
  - title: Feature C
    details: Lorem ipsum dolor sit amet, consectetur adipiscing elit
---

<style>
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #bd34fe 30%, #41d1ff);
  --vp-home-hero-image-background-image: linear-gradient(-45deg, #83dffd 50%, #47caff 50%);
  --vp-home-hero-image-filter: blur(44px);
  .image-bg{
    z-index: -1;
  }
}

@media (min-width: 640px) {
  :root {
    --vp-home-hero-image-filter: blur(56px);
  }
}

@media (min-width: 960px) {
  :root {
    --vp-home-hero-image-filter: blur(68px);
  }
}
</style>
