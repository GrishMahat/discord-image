import type { ImageInput } from "../../types";
import { createCanvas, loadImage } from "../../utils/canvas-compat";
import { getAssetPath } from "../../utils/paths";
import { validateURL } from "../../utils/utils";

/**
 * Add a heartbreaking effect to an image
 * @param image - The image URL or buffer to add the heartbreaking effect to
 * @returns Buffer containing the processed image
 */
export const heartbreaking = async (image: ImageInput): Promise<Buffer> => {
	try {
		if (!image) {
			throw new Error("Image is required");
		}

		const isValid = await validateURL(image);
		if (!isValid) {
			throw new Error("Invalid URL provided");
		}

		const canvas = createCanvas(610, 797);
		const ctx = canvas.getContext("2d");

		// Load and draw the user image
		const img = await loadImage(image);
		ctx.drawImage(img, 0, 150, 610, 610);

		// Load and draw the heartbreaking overlay
		const background = await loadImage(getAssetPath("heartbreaking.png"));
		ctx.drawImage(background, 0, 0, 610, 797);

		return canvas.toBuffer("image/png");
	} catch (error) {
		console.error("Error creating heartbreaking effect:", error);
		throw new Error(`Failed to create heartbreaking effect: ${error}`);
	}
};
