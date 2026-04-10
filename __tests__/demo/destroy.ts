import type { Demo } from '../demo-types';

export default {
  title: '销毁生命周期',
  setup([l2d]) {
    l2d.load({
      path: 'https://model.hacxy.cn/HK416-1-normal/model.json',
    }).then(() => {
      setTimeout(() => l2d.destroy(), 3000);
    });

    l2d.on('destroy', () => console.log('模型已被销毁'));
  },
} satisfies Demo;
