import type { Demo } from '../demo-types';

export default {
  title: 'Cubism2 双实例',
  canvasCount: 2,
  setup([l2d, l2d2]) {
    let timerId: ReturnType<typeof setTimeout> | null = null;

    l2d.load({
      path: 'https://model.hacxy.cn/shizuku/shizuku.model.json',
      scale: 0.8,
    }).then(() => {
      console.log(l2d.getMotions());
      timerId = setTimeout(() => {
        l2d.playMotionByFile('motions/flickHead_00.mtn');
      }, 1000);
    });

    l2d.on('motionstart', (group, index, duration, file) => {
      console.log(group, index, duration, file);
    });
    l2d.on('loadstart', total => console.log('start', total));
    l2d.on('loadprogress', (_loaded, _total, file) => console.log(file));
    l2d.on('loaded', () => console.log('模型已准备就绪, ===> event'));

    l2d2.load({
      path: 'https://model.hacxy.cn/Mao/Mao.model3.json',
    });

    return () => {
      if (timerId !== null)
        clearTimeout(timerId);
    };
  },
} satisfies Demo;
