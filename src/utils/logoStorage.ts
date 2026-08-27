/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getColegioHeaderImageBase64 } from './colegioEmblem';

const STORAGE_KEY = 'bitacora_custom_header_img';

export interface HeaderImageInfo {
  dataUrl: string;
  aspectRatio: number;
  isCustom: boolean;
}

let memoryCachedHeader: HeaderImageInfo | null = null;

/**
 * Gets the current active header image (custom or default) with its natural aspect ratio
 */
export async function getActiveHeaderInfo(): Promise<HeaderImageInfo> {
  if (memoryCachedHeader) {
    return memoryCachedHeader;
  }

  const customImg = localStorage.getItem(STORAGE_KEY);
  const src = customImg || getColegioHeaderImageBase64();

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const width = img.naturalWidth || 1000;
      const height = img.naturalHeight || 240;
      const aspectRatio = width / (height || 1);

      const info: HeaderImageInfo = {
        dataUrl: src,
        aspectRatio: aspectRatio > 0 ? aspectRatio : 4.16,
        isCustom: Boolean(customImg)
      };

      memoryCachedHeader = info;
      resolve(info);
    };

    img.onerror = () => {
      // Fallback
      const defaultUrl = getColegioHeaderImageBase64();
      const fallbackInfo: HeaderImageInfo = {
        dataUrl: defaultUrl,
        aspectRatio: 4.16,
        isCustom: false
      };
      memoryCachedHeader = fallbackInfo;
      resolve(fallbackInfo);
    };

    img.src = src;
  });
}

/**
 * Saves a new custom header image (optimizing resolution and aspect ratio via Canvas)
 */
export async function saveCustomHeaderImage(fileOrDataUrl: File | string): Promise<HeaderImageInfo> {
  return new Promise((resolve, reject) => {
    let dataUrlPromise: Promise<string>;

    if (typeof fileOrDataUrl === 'string') {
      dataUrlPromise = Promise.resolve(fileOrDataUrl);
    } else {
      dataUrlPromise = new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result as string);
        reader.onerror = (e) => rej(e);
        reader.readAsDataURL(fileOrDataUrl);
      });
    }

    dataUrlPromise
      .then((rawUrl) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          try {
            // Target clean high-DPI canvas max 2000px wide
            const maxWidth = 2000;
            const scale = img.naturalWidth > maxWidth ? maxWidth / img.naturalWidth : 1;
            const targetW = Math.round((img.naturalWidth || 1000) * scale);
            const targetH = Math.round((img.naturalHeight || 240) * scale);

            const canvas = document.createElement('canvas');
            canvas.width = targetW;
            canvas.height = targetH;
            const ctx = canvas.getContext('2d');

            if (ctx) {
              // Smooth rendering
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';
              ctx.drawImage(img, 0, 0, targetW, targetH);
              const optimizedUrl = canvas.toDataURL('image/png', 0.95);

              localStorage.setItem(STORAGE_KEY, optimizedUrl);
              const info: HeaderImageInfo = {
                dataUrl: optimizedUrl,
                aspectRatio: targetW / (targetH || 1),
                isCustom: true
              };
              memoryCachedHeader = info;
              resolve(info);
              return;
            }
          } catch (e) {
            console.warn('Canvas optimization failed, saving raw URL:', e);
          }

          localStorage.setItem(STORAGE_KEY, rawUrl);
          const info: HeaderImageInfo = {
            dataUrl: rawUrl,
            aspectRatio: (img.naturalWidth || 1000) / (img.naturalHeight || 240),
            isCustom: true
          };
          memoryCachedHeader = info;
          resolve(info);
        };
        img.onerror = () => {
          reject(new Error('No se pudo procesar la imagen seleccionada.'));
        };
        img.src = rawUrl;
      })
      .catch(reject);
  });
}

/**
 * Removes custom header image and reverts to default
 */
export function removeCustomHeaderImage(): void {
  localStorage.removeItem(STORAGE_KEY);
  memoryCachedHeader = null;
}

/**
 * Checks if custom header is currently active
 */
export function hasCustomHeaderImage(): boolean {
  return Boolean(localStorage.getItem(STORAGE_KEY));
}
