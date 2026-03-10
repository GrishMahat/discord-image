/** @format */

import { applyPalette, GIFEncoder, quantize } from "gifenc";
import type { ImageInput } from "../../types";
import { createCanvas, loadImage } from "../../utils/canvas-compat";
import { validateURL } from "../../utils/utils";

/**
 * Creates a blinking GIF animation from multiple images
 * @param delay - Time between frames in milliseconds
 * @param optionsOrFirstImage - Either options object or the first image (for backward compatibility)
 * @param images - Array of image URLs or buffers
 * @returns Buffer containing the generated GIF
 */
export const blink = async (
	delay: number,
	optionsOrFirstImage?:
		| {
				width?: number;
				height?: number;
				quality?: number;
				repeat?: number;
				transparent?: number | string;
				fitMethod?: "cover" | "contain" | "stretch";
		  }
		| ImageInput,
	...images: ImageInput[]
): Promise<Buffer> => {
	type GifFramePalette = Array<[number, number, number]>;

	let options: {
		width?: number;
		height?: number;
		quality?: number;
		repeat?: number;
		transparent?: number | string;
		fitMethod?: "cover" | "contain" | "stretch";
	} = {};

	// Handle backward compatibility - if optionsOrFirstImage is an image input, rearrange parameters
	if (optionsOrFirstImage !== undefined) {
		if (
			typeof optionsOrFirstImage === "string" ||
			optionsOrFirstImage instanceof Buffer
		) {
			// It's an image, not options
			images = [optionsOrFirstImage as ImageInput, ...images];
		} else {
			// It's options
			options = optionsOrFirstImage as {
				width?: number;
				height?: number;
				quality?: number;
				repeat?: number;
				transparent?: number | string;
				fitMethod?: "cover" | "contain" | "stretch";
			};
		}
	}

	// Validate inputs
	if (!images || images.length < 2) {
		throw new Error("You must provide at least two images.");
	}
	if (Number.isNaN(delay) || delay < 0) {
		throw new Error("Delay must be a non-negative number.");
	}

	// Set default options
	const width = options?.width || 360;
	const height = options?.height || 360;
	const quality = options?.quality || 10; // 1-20, lower is better
	const repeat = options?.repeat ?? 0; // 0 = loop forever
	const transparent = options?.transparent;
	const fitMethod = options?.fitMethod || "cover";

	// Resolve image inputs once so URLs/files are not fetched/read repeatedly.
	const resolvedImages = await Promise.all(
		images.map((image) => validateURL(image)),
	);
	if (resolvedImages.some((image) => !image)) {
		throw new Error("You must provide a valid image URL or buffer.");
	}

	// Initialize GIF encoder stream
	const GIF = GIFEncoder();

	// Create canvas for drawing images
	const canvas = createCanvas(width, height);
	const ctx = canvas.getContext("2d");

	// Process each image
	for (const [index, imageBuffer] of resolvedImages.entries()) {
		try {
			const base = await loadImage(imageBuffer);

			// Clear the canvas
			ctx.fillStyle = "rgba(0, 0, 0, 0)";
			ctx.clearRect(0, 0, width, height);

			// Calculate dimensions based on fit method
			const sx = 0;
			const sy = 0;
			const sWidth = base.width;
			const sHeight = base.height;
			let dx = 0,
				dy = 0,
				dWidth = width,
				dHeight = height;

			if (fitMethod === "cover") {
				// Cover - fill entire area, crop if needed
				const scale = Math.max(width / base.width, height / base.height);
				const scaledWidth = base.width * scale;
				const scaledHeight = base.height * scale;
				dx = (width - scaledWidth) / 2;
				dy = (height - scaledHeight) / 2;
				dWidth = scaledWidth;
				dHeight = scaledHeight;
			} else if (fitMethod === "contain") {
				// Contain - fit entire image, add padding if needed
				const scale = Math.min(width / base.width, height / base.height);
				const scaledWidth = base.width * scale;
				const scaledHeight = base.height * scale;
				dx = (width - scaledWidth) / 2;
				dy = (height - scaledHeight) / 2;
				dWidth = scaledWidth;
				dHeight = scaledHeight;
			}
			// 'stretch' is the default and uses the full dimensions

			// Draw the image
			ctx.drawImage(base, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);

			const imageData = ctx.getImageData(0, 0, width, height).data;
			// gifencoder used lower quality values for better output.
			// Keep similar semantics by reducing palette size as "quality" increases.
			const maxColors = Math.max(48, Math.min(192, 232 - quality * 8));
			const palette = quantize(imageData, maxColors) as GifFramePalette;
			const frame = applyPalette(imageData, palette);

			const transparentIndex = findTransparentIndex(palette, transparent);

			GIF.writeFrame(frame, width, height, {
				palette,
				delay,
				repeat: index === 0 ? repeat : undefined,
				transparent: transparentIndex !== undefined,
				transparentIndex,
			});
		} catch (error) {
			console.error(`Error processing image: ${error}`);
			throw new Error(`Failed to process image: ${error}`);
		}
	}

	// Finalize the GIF
	GIF.finish();
	return Buffer.from(GIF.bytes());
};

function parseTransparentColor(
	transparent?: number | string,
): [number, number, number] | undefined {
	if (transparent === undefined) return undefined;

	if (typeof transparent === "number") {
		return [
			(transparent >> 16) & 0xff,
			(transparent >> 8) & 0xff,
			transparent & 0xff,
		];
	}

	const normalized = transparent.trim();
	const hex = normalized.startsWith("#") ? normalized.slice(1) : normalized;
	if (!/^[\da-fA-F]{6}$/.test(hex)) return undefined;

	return [
		Number.parseInt(hex.slice(0, 2), 16),
		Number.parseInt(hex.slice(2, 4), 16),
		Number.parseInt(hex.slice(4, 6), 16),
	];
}

function findTransparentIndex(
	palette: Array<[number, number, number]>,
	transparent?: number | string,
): number | undefined {
	const transparentColor = parseTransparentColor(transparent);
	if (!transparentColor) return undefined;

	const [tr, tg, tb] = transparentColor;
	const index = palette.findIndex(
		([r, g, b]) => r === tr && g === tg && b === tb,
	);

	return index >= 0 ? index : undefined;
}
