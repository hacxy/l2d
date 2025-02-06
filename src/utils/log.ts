// eslint-disable-next-line no-console
const originalConsoleLog = console.log;

// eslint-disable-next-line no-console
console.log = function (...args) {
  // 检查第一个参数是否是字符串并且以 [CSM] 开头
  if (typeof args[0] === 'string' && args[0].startsWith('[CSM]')) {
    // 调用原始的 console.log 函数
    originalConsoleLog.apply(console, args);
  }
};
