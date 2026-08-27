/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getActiveHeaderInfo, HeaderImageInfo } from './logoStorage';

/**
 * Returns the currently active header image and aspect ratio for PDF rendering
 */
export async function getHeaderImagePNG(): Promise<string> {
  const info = await getActiveHeaderInfo();
  return info.dataUrl;
}

export async function getHeaderRenderInfo(): Promise<HeaderImageInfo> {
  return await getActiveHeaderInfo();
}
