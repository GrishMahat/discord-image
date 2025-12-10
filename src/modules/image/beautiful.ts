/** @format */

import { join } from "node:path";
import { Jimp } from "jimp";
import type { ImageInput } from "../../types";
import { validateURL } from "../../utils/utils";

/**
 * Creates a "beautiful" meme using the Drake template
 * @param image - The image URL or buffer to process
 * @returns Promise<Buffer> - The generated meme image
 */
export const beautiful = async (image: ImageInput): Promise<Buffer> => {
	if (!image) {
		throw new Error("You must provide an image as the first argument.");
	}

	const isValid = await validateURL(image);
	if (!isValid) {
		throw new Error("You must provide a valid image URL or buffer.");
	}

	try {
		// Load and resize the template
		const base = await Jimp.read(join(__dirname, "../../assets/beautiful.png"));
		base.resize({ w: 376, h: 400 });

		// Load and resize the user image
		const img = await Jimp.read(image);
		img.resize({ w: 84, h: 95 });

		// Composite the user image twice onto the template
		base.composite(img, 258, 28);
		base.composite(img, 258, 229);

		// Return the processed image
		return await base.getBuffer("image/png");
	} catch (error) {
		throw new Error(`Failed to process image: ${error}`);
	}
};
