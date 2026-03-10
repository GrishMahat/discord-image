/** @format */

import { isAbsolute, normalize, resolve, sep } from "node:path";

const ASSETS_DIR = resolve(__dirname, "../assets");

function sanitizeAssetName(filename: string): string {
	if (!filename || !filename.trim()) {
		throw new Error("Asset filename is required");
	}

	const trimmed = filename.trim();
	if (isAbsolute(trimmed)) {
		throw new Error("Asset filename must be a relative path");
	}

	const normalized = normalize(trimmed).replace(/^[/\\]+/, "");
	if (normalized === ".." || normalized.startsWith(`..${sep}`)) {
		throw new Error("Asset filename cannot traverse outside assets directory");
	}

	return normalized;
}

/**
 * Get absolute path to an asset file
 * Centralizes all template/asset path resolution
 */
export const getAssetPath = (filename: string): string =>
	resolve(ASSETS_DIR, sanitizeAssetName(filename));

/**
 * Alias for template images specifically
 */
export const template = getAssetPath;

/**
 * Get absolute assets directory path
 */
export const getAssetsDir = (): string => ASSETS_DIR;

/**
 * Centralized PNG buffer generation
 * Ensures consistent mime type across all canvas operations
 */
export const renderPNG = (canvas: {
	toBuffer: (mimeType: string) => Buffer;
}): Buffer => canvas.toBuffer("image/png");
