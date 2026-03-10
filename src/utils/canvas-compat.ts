/** @format */

import { readFileSync } from "node:fs";
import { templateCache } from "./image-cache";

/**
 * Canvas compatibility layer
 * Supports both node-canvas and @napi-rs/canvas for better Node.js compatibility
 */

let canvasImpl: any;
let Canvas: any;
let CanvasRenderingContext2D: any;
let Image: any;
let loadImageImpl: any;
let createCanvas: any;
let registerFontImpl: any;
let Path2D: any;

function dynamicRequire(moduleName: string): any {
	// biome-ignore lint/security/noGlobalEval: Dynamic require for optional dependencies
	return eval("require")(moduleName);
}

try {
	// Try @napi-rs/canvas first (better Node.js v24+ support)
	canvasImpl = dynamicRequire("@napi-rs/canvas");
	Canvas = canvasImpl.Canvas;
	CanvasRenderingContext2D = canvasImpl.CanvasRenderingContext2D;
	Image = canvasImpl.Image;
	loadImageImpl = canvasImpl.loadImage;
	createCanvas = canvasImpl.createCanvas;
	Path2D = canvasImpl.Path2D;

	registerFontImpl = (path: string, options?: { family: string }) => {
		if (canvasImpl.GlobalFonts?.registerFromPath) {
			canvasImpl.GlobalFonts.registerFromPath(path, options?.family);
			return;
		}
		if (canvasImpl.registerFont) {
			canvasImpl.registerFont(path, options);
		}
	};
} catch (napiError: any) {
	try {
		// Fallback to node-canvas
		canvasImpl = dynamicRequire("canvas");
		Canvas = canvasImpl.Canvas;
		CanvasRenderingContext2D = canvasImpl.CanvasRenderingContext2D;
		Image = canvasImpl.Image;
		loadImageImpl = canvasImpl.loadImage;
		createCanvas = canvasImpl.createCanvas;
		Path2D = canvasImpl.Path2D || class {};

		registerFontImpl = (path: string, options?: { family: string }) => {
			if (canvasImpl.registerFont) {
				canvasImpl.registerFont(path, options);
			}
		};
	} catch (canvasError: any) {
		throw new Error(
			"No canvas implementation found. Please install either @napi-rs/canvas or canvas:\n" +
				"npm install @napi-rs/canvas\n" +
				"or\n" +
				"npm install canvas\n\n" +
				`@napi-rs/canvas error: ${napiError?.message || "Unknown error"}\n` +
				`canvas error: ${canvasError?.message || "Unknown error"}`,
		);
	}
}

if (typeof createCanvas !== "function") {
	throw new Error("Canvas createCanvas function is unavailable");
}

if (typeof registerFontImpl !== "function") {
	registerFontImpl = () => {
		// no-op if current backend does not support font registration
	};
}

function isBufferLike(obj: any): boolean {
	return (
		obj &&
		typeof obj === "object" &&
		typeof obj.length === "number" &&
		typeof obj.buffer !== "undefined"
	);
}

function normalizeImageSource(source: any): any {
	if (isBufferLike(source)) {
		return source;
	}

	if (typeof source === "string") {
		if (
			source.startsWith("data:") ||
			source.startsWith("http://") ||
			source.startsWith("https://")
		) {
			return source;
		}
		const cacheKey = `canvas:path:${source}`;
		const cached = templateCache.get(cacheKey);
		if (cached && Buffer.isBuffer(cached)) {
			return cached;
		}

		const fileBuffer = readFileSync(source);
		templateCache.set(cacheKey, fileBuffer);
		return fileBuffer;
	}

	return source;
}

// Compatibility wrapper for loadImage to handle different signatures
const compatLoadImage = async (source: any): Promise<any> => {
	try {
		const normalizedSource = normalizeImageSource(source);

		if (typeof loadImageImpl === "function") {
			return await loadImageImpl(normalizedSource);
		}

		const img = new Image();
		return await new Promise((resolve, reject) => {
			img.onload = () => resolve(img);
			img.onerror = reject;
			img.src = normalizedSource;
		});
	} catch (error: any) {
		throw new Error(`Failed to load image: ${error?.message || String(error)}`);
	}
};

const registerFont = (path: string, options?: { family: string }): void => {
	registerFontImpl(path, options);
};

// Export compatible interface
export {
	Canvas,
	CanvasRenderingContext2D,
	Image,
	createCanvas,
	registerFont,
	Path2D,
	compatLoadImage as loadImage,
};

// Export types properly for TypeScript
export type NodeCanvasRenderingContext2D = any;
export type CanvasType = any;
export type ImageType = any;
