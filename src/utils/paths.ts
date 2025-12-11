/** @format */

import { join } from "node:path";

/**
 * Get absolute path to an asset file
 * Centralizes all template/asset path resolution
 */
export const getAssetPath = (filename: string): string =>
	join(__dirname, "../assets", filename);

/**
 * Alias for template images specifically
 */
export const template = getAssetPath;

/**
 * Centralized PNG buffer generation
 * Ensures consistent mime type across all canvas operations
 */
export const renderPNG = (canvas: {
	toBuffer: (mimeType: string) => Buffer;
}): Buffer => canvas.toBuffer("image/png");
