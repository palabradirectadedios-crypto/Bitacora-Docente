/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getColegioHeaderImageBase64 } from './colegioEmblem';

// Cached high-res header image Data URL
let cachedHeaderPNG: string | null = null;

/**
 * Pre-renders the official SVG header onto a high-DPI HTML canvas and outputs a high-quality PNG data URL
 */
export async function getHeaderImagePNG(): Promise<string> {
  if (cachedHeaderPNG) {
    return cachedHeaderPNG;
  }

  return new Promise((resolve) => {
    try {
      const svgUrl = getColegioHeaderImageBase64();
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          // High resolution for 300 DPI print quality
          canvas.width = 2000;
          canvas.height = 480;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const pngData = canvas.toDataURL('image/png', 1.0);
            cachedHeaderPNG = pngData;
            resolve(pngData);
            return;
          }
        } catch (e) {
          console.warn('Canvas conversion failed, fallback to SVG base64:', e);
        }
        resolve(svgUrl);
      };

      img.onerror = () => {
        resolve(svgUrl);
      };

      img.src = svgUrl;
    } catch (e) {
      console.warn('Error loading header image:', e);
      resolve(getColegioHeaderImageBase64());
    }
  });
}
