// @ts-nocheck
/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import type { iterator } from '../core/type/csmvector.js';
import type { LAppGlManager } from './lappglmanager.js';
import { csmVector } from '../core/type/csmvector.js';
import logger from '../../logger.js';

/**
 * テクスチャ管理クラス
 * 画像読み込み、管理を行うクラス。
 */
export class LAppTextureManager {
  /**
   * コンストラクタ
   */
  public constructor() {
    this._textures = new csmVector<TextureInfo>();
  }

  /**
   * 解放する。
   */
  public release(): void {
    for (
      let ite: iterator<TextureInfo> = this._textures.begin();
      ite.notEqual(this._textures.end());
      ite.preIncrement()
    ) {
      this._glManager.getGl().deleteTexture(ite.ptr().id);
    }
    this._textures = null;
  }

  /**
   * 画像読み込み
   *
   * @param fileName 読み込む画像ファイルパス名
   * @param usePremultiply Premult処理を有効にするか
   * @return 画像情報、読み込み失敗時はnullを返す
   */
  public createTextureFromPngFile(
    fileName: string,
    usePremultiply: boolean,
    callback: (textureInfo: TextureInfo) => void
  ): void {
    // 检查是否是跨域 URL
    const isCrossOrigin = (url: string): boolean => {
      try {
        const urlObj = new URL(url, window.location.href);
        return urlObj.origin !== window.location.origin;
      }
      catch {
        // 如果 URL 解析失败，假设是相对路径，不是跨域
        return false;
      }
    };

    // search loaded texture already
    for (
      let ite: iterator<TextureInfo> = this._textures.begin();
      ite.notEqual(this._textures.end());
      ite.preIncrement()
    ) {
      if (
        ite.ptr().fileName == fileName
        && ite.ptr().usePremultply == usePremultiply
      ) {
        // 2回目以降はキャッシュが使用される(待ち時間なし)
        // WebKitでは同じImageのonloadを再度呼ぶには再インスタンスが必要
        // 詳細：https://stackoverflow.com/a/5024181
        ite.ptr().img = new Image();
        // 跨域图片需要设置 crossOrigin（必须在设置 src 之前）
        if (isCrossOrigin(fileName)) {
          ite.ptr().img.crossOrigin = 'anonymous';
        }
        ite
          .ptr()
          .img
          .addEventListener('load', (): void => callback(ite.ptr()), {
            passive: true
          });
        ite
          .ptr()
          .img
          .addEventListener('error', (e): void => {
            logger.error(`Failed to load image: ${fileName}. This may be a CORS issue. Please ensure the server returns 'Access-Control-Allow-Origin' header.`);
            console.error('Image load error:', e);
          }, {
            passive: true
          });
        ite.ptr().img.src = fileName;
        return;
      }
    }

    // データのオンロードをトリガーにする
    const img = new Image();
    // 跨域图片需要设置 crossOrigin（必须在设置 src 之前）
    if (isCrossOrigin(fileName)) {
      img.crossOrigin = 'anonymous';
    }
    img.addEventListener(
      'error',
      (e): void => {
        logger.error(`Failed to load image: ${fileName}. This may be a CORS issue. Please ensure the server returns 'Access-Control-Allow-Origin' header.`);
        console.error('Image load error:', e);
        console.error('Image URL:', fileName);
        console.error('Is cross-origin:', isCrossOrigin(fileName));
      },
      { passive: true }
    );
    img.addEventListener(
      'load',
      (): void => {
        // テクスチャオブジェクトの作成
        const tex: WebGLTexture = this._glManager.getGl().createTexture();

        // テクスチャを選択
        this._glManager
          .getGl()
          .bindTexture(this._glManager.getGl().TEXTURE_2D, tex);

        // テクスチャにピクセルを書き込む
        this._glManager
          .getGl()
          .texParameteri(
            this._glManager.getGl().TEXTURE_2D,
            this._glManager.getGl().TEXTURE_MIN_FILTER,
            this._glManager.getGl().LINEAR_MIPMAP_LINEAR
          );
        this._glManager
          .getGl()
          .texParameteri(
            this._glManager.getGl().TEXTURE_2D,
            this._glManager.getGl().TEXTURE_MAG_FILTER,
            this._glManager.getGl().LINEAR
          );

        // Premult処理を行わせる
        if (usePremultiply) {
          this._glManager
            .getGl()
            .pixelStorei(
              this._glManager.getGl().UNPACK_PREMULTIPLY_ALPHA_WEBGL,
              1
            );
        }

        // テクスチャにピクセルを書き込む
        try {
          this._glManager
            .getGl()
            .texImage2D(
              this._glManager.getGl().TEXTURE_2D,
              0,
              this._glManager.getGl().RGBA,
              this._glManager.getGl().RGBA,
              this._glManager.getGl().UNSIGNED_BYTE,
              img
            );
        }
        catch (error) {
          logger.error(`Failed to upload image to WebGL texture: ${fileName}`);
          logger.error('Error details:', error);
          logger.error('This is likely a CORS issue. Please ensure:');
          logger.error('1. The image server returns "Access-Control-Allow-Origin" header');
          logger.error('2. The image was loaded with crossOrigin="anonymous"');
          logger.error('3. The image URL is correct and accessible');
          console.error('WebGL texImage2D error:', error);
          console.error('Image element:', img);
          console.error('Image complete:', img.complete);
          console.error('Image naturalWidth:', img.naturalWidth);
          console.error('Image naturalHeight:', img.naturalHeight);
          return;
        }

        // ミップマップを生成
        this._glManager
          .getGl()
          .generateMipmap(this._glManager.getGl().TEXTURE_2D);

        // テクスチャをバインド
        this._glManager
          .getGl()
          .bindTexture(this._glManager.getGl().TEXTURE_2D, null);

        const textureInfo: TextureInfo = new TextureInfo();
        if (textureInfo != null) {
          textureInfo.fileName = fileName;
          textureInfo.width = img.width;
          textureInfo.height = img.height;
          textureInfo.id = tex;
          textureInfo.img = img;
          textureInfo.usePremultply = usePremultiply;
          if (this._textures != null) {
            this._textures.pushBack(textureInfo);
          }
        }

        callback(textureInfo);
      },
      { passive: true }
    );
    logger.info(`Load Texture: ${fileName}`);
    img.src = fileName;
  }

  /**
   * 画像の解放
   *
   * 配列に存在する画像全てを解放する。
   */
  public releaseTextures(): void {
    for (let i = 0; i < this._textures.getSize(); i++) {
      this._glManager.getGl().deleteTexture(this._textures.at(i).id);
      this._textures.set(i, null);
    }

    this._textures.clear();
  }

  /**
   * 画像の解放
   *
   * 指定したテクスチャの画像を解放する。
   * @param texture 解放するテクスチャ
   */
  public releaseTextureByTexture(texture: WebGLTexture): void {
    for (let i = 0; i < this._textures.getSize(); i++) {
      if (this._textures.at(i).id != texture) {
        continue;
      }

      this._glManager.getGl().deleteTexture(this._textures.at(i).id);
      this._textures.set(i, null);
      this._textures.remove(i);
      break;
    }
  }

  /**
   * 画像の解放
   *
   * 指定した名前の画像を解放する。
   * @param fileName 解放する画像ファイルパス名
   */
  public releaseTextureByFilePath(fileName: string): void {
    for (let i = 0; i < this._textures.getSize(); i++) {
      if (this._textures.at(i).fileName == fileName) {
        this._glManager.getGl().deleteTexture(this._textures.at(i).id);
        this._textures.set(i, null);
        this._textures.remove(i);
        break;
      }
    }
  }

  /**
   * setter
   * @param glManager
   */
  public setGlManager(glManager: LAppGlManager): void {
    this._glManager = glManager;
  }

  _textures: csmVector<TextureInfo>;
  private _glManager: LAppGlManager;
}

/**
 * 画像情報構造体
 */
export class TextureInfo {
  img: HTMLImageElement; // 画像
  id: WebGLTexture = null; // テクスチャ
  width = 0; // 横幅
  height = 0; // 高さ
  usePremultply: boolean; // Premult処理を有効にするか
  fileName: string; // ファイル名
}
