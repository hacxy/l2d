// import { AppDelegate as Cubism5Model } from './cubism5/index.js';

import '../lib/cubism2.js';

import '../lib/cubism5.js';
/* eslint-disable perfectionist/sort-imports */
import Cubism2Model from './cubism2/index.js';
// import { L2D } from './l2d.js';

// export * from './constants.js';
// export type { L2D } from './l2d.js';
// export type * from './model.js';
// export type * from './types.js';

function loadExternalResource(url: string, type: string): Promise<string> {
  return new Promise((resolve: any, reject: any) => {
    let tag;

    if (type === 'css') {
      tag = document.createElement('link');
      tag.rel = 'stylesheet';
      tag.href = url;
    }
    else if (type === 'js') {
      tag = document.createElement('script');
      tag.src = url;
    }
    if (tag) {
      tag.onload = () => resolve(url);
      tag.onerror = () => reject(url);
      document.head.appendChild(tag);
    }
  });
}

/**
 * Initialize L2D instance
 * @param canvasEl canvas element
 * @returns L2D instance
 */
export function init(canvasEl: HTMLCanvasElement | null) {
  if (!canvasEl) {
    throw new TypeError('Target element node not found.');
  }
  if (!(canvasEl instanceof HTMLCanvasElement)) {
    throw new TypeError('Target element node is not a canvas element.');
  }

  // 确保 canvas 有 id
  if (!canvasEl.id) {
    canvasEl.id = 'l2d';
  }

  // 确保 canvas 有宽高，使用父容器的实际尺寸
  // canvas 元素的 width/height 属性需要设置为实际像素值，而不是通过 CSS
  const rect = canvasEl.getBoundingClientRect();
  const width = rect.width || canvasEl.clientWidth || 400;
  const height = rect.height || canvasEl.clientHeight || 500;
  canvasEl.width = width;
  canvasEl.height = height;

  const cubism2Model = new Cubism2Model(canvasEl.id);

  // 初始化函数
  async function initializeModel() {
    // 确保 DOM 已加载完成
    if (document.readyState === 'loading') {
      await new Promise(resolve => {
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', resolve);
        }
        else {
          resolve(true);
        }
      });
    }

    // canvasEl 已经在上层验证过不为 null
    const canvas = canvasEl!;

    // 确保 canvas 元素在 DOM 中
    if (!canvas.isConnected) {
      console.warn('Canvas 元素尚未添加到 DOM，尝试添加到 body');
      document.body.appendChild(canvas);
    }

    // 验证 canvas 元素可以通过 id 找到
    const foundCanvas = document.getElementById(canvas.id) as HTMLCanvasElement | null;
    if (!foundCanvas || foundCanvas !== canvas) {
      console.error(`无法通过 id "${canvas.id}" 找到 canvas 元素`);
      return;
    }

    // 先加载 Live2D SDK
    await loadExternalResource('/live2d.min.js', 'js');

    // 等待 Live2D SDK 加载完成
    if (!(await waitForLive2DSDK())) {
      return;
    }

    // 验证并准备 canvas
    const canvasById = await prepareCanvas(canvas);
    if (!canvasById) {
      return;
    }

    // 加载模型配置并初始化
    await loadAndInitModel(cubism2Model, canvasById);
  }

  // 等待 Live2D SDK 加载
  async function waitForLive2DSDK(): Promise<boolean> {
    let attempts = 0;
    const maxAttempts = 100; // 100 * 50ms = 5秒
    while (typeof (window as any).Live2D === 'undefined' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 50));
      attempts++;
    }

    if (typeof (window as any).Live2D === 'undefined') {
      console.error('Live2D SDK 加载超时');
      return false;
    }
    return true;
  }

  // 准备 canvas 元素
  async function prepareCanvas(canvas: HTMLCanvasElement): Promise<HTMLCanvasElement | null> {
    await new Promise(resolve => setTimeout(resolve, 100));

    const canvasById = document.getElementById(canvas.id);
    if (!canvasById || !(canvasById instanceof HTMLCanvasElement)) {
      console.error(`初始化时无法找到 canvas 元素 (id: ${canvas.id})`);
      console.error('Canvas 元素状态:', {
        id: canvas.id,
        isConnected: canvas.isConnected,
        parentElement: canvas.parentElement,
      });
      return null;
    }

    if (canvasById !== canvas) {
      console.warn('找到的 canvas 元素与传入的元素不一致，使用找到的元素');
    }

    // 确保 canvas 有正确的尺寸
    if (!canvasById.width || !canvasById.height) {
      const rect = canvasById.getBoundingClientRect();
      canvasById.width = rect.width || 400;
      canvasById.height = rect.height || 500;
    }

    return canvasById;
  }

  // 加载模型配置并初始化
  async function loadAndInitModel(model: typeof cubism2Model, canvas: HTMLCanvasElement) {
    // 等待一小段时间确保 DOM 完全稳定
    await new Promise(resolve => setTimeout(resolve, 50));

    // 多次尝试查找 canvas 元素，最多尝试 10 次
    let canvasById: HTMLCanvasElement | null = null;
    for (let i = 0; i < 10; i++) {
      canvasById = document.getElementById(canvas.id) as HTMLCanvasElement | null;
      if (canvasById && canvasById instanceof HTMLCanvasElement) {
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    if (!canvasById || !(canvasById instanceof HTMLCanvasElement)) {
      console.error(`调用 init 前无法找到 canvas 元素 (id: ${canvas.id})`);
      console.error('Canvas 元素状态:', {
        id: canvas.id,
        isConnected: canvas.isConnected,
        parentElement: canvas.parentElement,
        documentContains: document.contains(canvas),
        allCanvasElements: Array.from(document.querySelectorAll('canvas')).map(c => ({ id: c.id, tagName: c.tagName })),
      });
      return;
    }

    // 确保 canvas 有正确的尺寸
    if (!canvasById.width || !canvasById.height) {
      const rect = canvasById.getBoundingClientRect();
      canvasById.width = rect.width || 400;
      canvasById.height = rect.height || 500;
    }

    const res = await fetch('https://model.hacxy.cn/cat-black/model.json');
    if (!res.ok) {
      console.error(`获取模型配置失败: ${res.statusText}`);
      return;
    }
    const result = await res.json();

    // 使用找到的 canvas 元素的 id
    console.log(`准备初始化 Live2D，canvas id: ${canvasById.id}, 尺寸: ${canvasById.width}x${canvasById.height}`);
    await model.init(canvasById.id, 'https://model.hacxy.cn/cat-black/model.json', result);
  }

  // 开始初始化
  initializeModel().catch(error => {
    console.error('初始化 Live2D 模型失败:', error);
  });

  return cubism2Model;
}
