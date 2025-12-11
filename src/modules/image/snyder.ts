/** @format */

import type { ImageInput } from "../../types";
import type {
	ImageType,
	NodeCanvasRenderingContext2D,
} from "../../utils/canvas-compat";
import { createCanvas, loadImage } from "../../utils/canvas-compat";
import { getAssetPath } from "../../utils/paths";
import { validateURL } from "../../utils/utils";

/**
 * Add a Snyder meme to an image
 * @param image - The image URL or buffer to add the Snyder meme to
 * @returns Buffer containing the processed image
 */
export const snyder = async (image: ImageInput): Promise<Buffer> => {
	try {
		if (!image) {
			throw new Error("Image is required");
		}

		const isValid = await validateURL(image);
		if (!isValid) {
			throw new Error("Invalid URL provided");
		}

		const canvas = createCanvas(610, 343);
		const ctx = canvas.getContext("2d");

		// Load images
		const [userImage, background] = await Promise.all([
			loadImage(image),
			loadImage(getAssetPath("snyder.png")),
		]);

		// Draw black background
		ctx.fillStyle = "#000000";
		ctx.fillRect(0, 0, 610, 343);

		// Draw rotated user image
		drawImage(ctx, userImage, 62, 70, 300, 300, -6);

		// Draw snyder overlay
		ctx.drawImage(background, 0, 0, 610, 343);

		return canvas.toBuffer("image/png");
	} catch (error) {
		console.error("Error creating snyder meme:", error);
		throw new Error(`Failed to create snyder meme: ${error}`);
	}
};

function drawImage(
	ctx: NodeCanvasRenderingContext2D,
	image: ImageType,
	x: number,
	y: number,
	w: number,
	h: number,
	degrees: number,
): void {
	ctx.save();
	ctx.translate(x + w / 2, y + h / 2);
	ctx.rotate((degrees * Math.PI) / 180.0);
	ctx.translate(-x - w / 2, -y - h / 2);
	ctx.drawImage(image, x, y, w, h);
	ctx.restore();
}
