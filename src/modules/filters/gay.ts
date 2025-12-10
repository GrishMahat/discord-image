/** @format */

import { join } from "node:path";
import type { ImageInput } from "../../types";
import { createCanvas, loadImage } from "../../utils/canvas-compat";
import { validateURL } from "../../utils/utils";

/**
 * Overlays a "gay" effect image on top of the provided image.
 *
 * @param image - The image URL or Buffer to process.
 * @returns A Promise resolving with a Buffer containing the processed PNG image.
 * @throws If no image is provided, if the image is invalid, or if image processing fails.
 */
export const gay = async (image: ImageInput): Promise<Buffer> => {
	if (!image) {
		throw new Error("You must provide an image as the first argument.");
	}

	const isValid = await validateURL(image);
	if (!isValid) {
		throw new Error("You must provide a valid image URL or buffer.");
	}

	try {
		// Construct the absolute path to the overlay asset.
		const assetPath = join(__dirname, "../../assets/gay.png");

		// Load both the overlay and the user image concurrently.
		const [bg, img] = await Promise.all([
			loadImage(assetPath),
			loadImage(image),
		]);

		const canvasSize = 480;
		const canvas = createCanvas(canvasSize, canvasSize);
		const ctx = canvas.getContext("2d");

		// Draw the user image first, then overlay the effect.
		ctx.drawImage(img, 0, 0, canvasSize, canvasSize);
		ctx.drawImage(bg, 0, 0, canvasSize, canvasSize);

		// Return the processed image as a PNG buffer.
		return canvas.toBuffer("image/png");
	} catch (error) {
		throw new Error(`Failed to process image: ${error}`);
	}
};
