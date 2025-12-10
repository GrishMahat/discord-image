/** @format */

import { Jimp } from "jimp";
import type { ImageInput } from "../../types";
import { validateURL } from "../../utils/utils";

/**
 * Applies a greyscale effect to an image.
 * @param image - The image URL or buffer to process.
 * @returns A Promise that resolves with a Buffer containing the processed image.
 */
export const greyscale = async (image: ImageInput): Promise<Buffer> => {
	const isValid = await validateURL(image);
	if (!isValid) {
		throw new Error("You must provide a valid image URL or buffer.");
	}

	try {
		const jimpImage = await Jimp.read(image);
		jimpImage.greyscale();

		const buffer = await jimpImage.getBuffer("image/png");
		return buffer;
	} catch (error) {
		throw new Error(
			`Failed to process the image: ${
				error instanceof Error ? error.message : String(error)
			}`,
		);
	}
};
