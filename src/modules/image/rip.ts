import type { ImageInput } from "../../types";
import { createCanvas, loadImage } from "../../utils/canvas-compat";
import { validateURL } from "../../utils/utils";

/**
 * Add a rip meme to an image
 * @param image - The image URL or buffer to add the rip meme to
 * @returns Buffer containing the processed image
 */
export const rip = async (image: ImageInput): Promise<Buffer> => {
	try {
		if (!image) {
			throw new Error("Image is required");
		}

		const isValid = await validateURL(image);
		if (!isValid) {
			throw new Error("Invalid URL provided");
		}

		// Create canvas and get context
		const canvas = createCanvas(720, 405);
		const ctx = canvas.getContext("2d");

		// Load images
		const [avatar, background] = await Promise.all([
			loadImage(image),
			loadImage(`${__dirname}/../../assets/rip.png`),
		]);

		// Draw avatar first
		ctx.drawImage(avatar, 110, 47, 85, 85);

		// Draw background overlay
		ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

		return canvas.toBuffer();
	} catch (error) {
		console.error("Error creating rip meme:", error);
		throw new Error(`Failed to create rip meme: ${error}`);
	}
};
