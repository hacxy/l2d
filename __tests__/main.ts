// eslint-disable-next-line antfu/no-import-dist
import { init } from '../dist';

const app1 = init(document.getElementById('app'));
const app2 = init(document.getElementById('main'));
init(document.getElementById('main2'));
init(document.getElementById('main3'));

app1.loadModel({
  path: 'https://model.hacxy.cn/Pio/model.json',
});

app1.on('loaded', () => {
  app1.setModel({
    scale: 0.5
  });
});
