import type { Demo } from '../demo-types';

export default {
  title: '销毁生命周期',
  setup([l2d]) {
    let countdownId: ReturnType<typeof setInterval> | null = null;
    l2d.load({
      path: 'https://model.hacxy.cn/HK416-1-normal/model.json',
    }).then(() => {
      let remain = 3;
      console.log(`销毁倒计时: ${remain}`);
      countdownId = setInterval(() => {
        remain -= 1;
        if (remain > 0) {
          console.log(`销毁倒计时: ${remain}`);
          return;
        }
        if (countdownId !== null) {
          clearInterval(countdownId);
          countdownId = null;
        }
        l2d.destroy();
      }, 1000);
    });

    l2d.on('destroy', () => console.log('模型已被销毁'));
    return () => {
      if (countdownId !== null)
        clearInterval(countdownId);
    };
  },
} satisfies Demo;
