import type { ImageInput } from "../../types";
import { createCanvas, loadImage } from "../../utils/canvas-compat";
import { getAssetPath } from "../../utils/paths";
import { validateURL } from "../../utils/utils";

/**
 * Creates a tattoo effect on an image
 * @param image - The image URL or buffer to apply the tattoo effect to
 * @returns Promise<Buffer> - The generated tattoo image
 */
export const tatoo = async (image: ImageInput): Promise<Buffer> => {
	if (!image) {
		throw new Error("Image is required");
	}

	const isValid = await validateURL(image);
	if (!isValid) {
		throw new Error("Invalid image URL or buffer provided");
	}

	try {
		// Set up canvas with correct dimensions for tattoo template
		const canvas = createCanvas(750, 1089);
		const ctx = canvas.getContext("2d");

		// Load images
		const [avatar, tatooTemplate] = await Promise.all([
			loadImage(image),
			loadImage(getAssetPath("tatoo.png")),
		]);

		// Draw the user's image first
		ctx.drawImage(avatar, 145, 575, 400, 400);

		// Overlay the tattoo template
		ctx.drawImage(tatooTemplate, 0, 0, 750, 1089);

		return canvas.toBuffer("image/png");
	} catch (error) {
		throw new Error(`Failed to generate tattoo image: ${error}`);
	}
};
