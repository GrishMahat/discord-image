/** @format */

/**
 * this this witten by ai so review it
 * Canvas compatibility layer
 * Supports both node-canvas and @napi-rs/canvas for better Node.js compatibility
 */

let canvasImpl: any;
let Canvas: any;
let CanvasRenderingContext2D: any;
let Image: any;
let loadImage: any;
let createCanvas: any;
let registerFont: any;
let Path2D: any;

try {
	// Try @napi-rs/canvas first (better Node.js v24+ support)
	// biome-ignore lint/security/noGlobalEval: Dynamic require for compatibility
	canvasImpl = eval("require")("@napi-rs/canvas");
	Canvas = canvasImpl.Canvas;
	CanvasRenderingContext2D = canvasImpl.CanvasRenderingContext2D;
	Image = canvasImpl.Image;
	loadImage = canvasImpl.loadImage;
	createCanvas = canvasImpl.createCanvas;
	Path2D = canvasImpl.Path2D;
	// Wrapper for font registration to handle differences between libraries
	registerFont = (path: string, options?: { family: string }) => {
		if (canvasImpl.GlobalFonts?.registerFromPath) {
			// @napi-rs/canvas: registerFromPath(path, alias?)
			canvasImpl.GlobalFonts.registerFromPath(path, options?.family);
		} else if (canvasImpl.registerFont) {
			// node-canvas: registerFont(path, options)
			canvasImpl.registerFont(path, options);
		}
	};

	console.log("Using @napi-rs/canvas for better performance and compatibility");
} catch (napiError: any) {
	try {
		// Fallback to node-canvas
		// biome-ignore lint/security/noGlobalEval: Dynamic require for compatibility
		canvasImpl = eval("require")("canvas");
		Canvas = canvasImpl.Canvas;
		CanvasRenderingContext2D = canvasImpl.CanvasRenderingContext2D;
		Image = canvasImpl.Image;
		loadImage = canvasImpl.loadImage;
		createCanvas = canvasImpl.createCanvas;
		// node-canvas might not export Path2D directly in all versions, but usually it does
		Path2D = canvasImpl.Path2D || class {};
		registerFont = (path: string, options?: { family: string }) => {
			if (canvasImpl.registerFont) {
				canvasImpl.registerFont(path, options);
			}
		};

		console.log("Using node-canvas (fallback)");
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

// Check if something is Buffer-like
function isBufferLike(obj: any): boolean {
	return (
		obj &&
		typeof obj === "object" &&
		typeof obj.length === "number" &&
		typeof obj.buffer !== "undefined"
	);
}

// Compatibility wrapper for loadImage to handle different signatures
const compatLoadImage = async (source: any): Promise<any> => {
	try {
		if (typeof loadImage === "function") {
			return await loadImage(source);
		}

		// Fallback implementation for different canvas libraries
		const img = new Image();
		return new Promise((resolve, reject) => {
			img.onload = () => resolve(img);
			img.onerror = reject;

			if (isBufferLike(source)) {
				img.src = source;
			} else if (typeof source === "string") {
				if (source.startsWith("data:") || source.startsWith("http")) {
					img.src = source;
				} else {
					// Assume it's a file path
					// biome-ignore lint/security/noGlobalEval: Dynamic require for compatibility
					const fs = eval("require")("fs");
					const data = fs.readFileSync(source);
					img.src = data;
				}
			} else {
				img.src = source;
			}
		});
	} catch (error: any) {
		throw new Error(`Failed to load image: ${error?.message || String(error)}`);
	}
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
