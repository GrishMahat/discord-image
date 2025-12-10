/** @format */

import { Jimp } from "jimp";
import type { ImageInput } from "../../types";
import { validateURL } from "../../utils/utils";

/**
 * Overlays a "gay" effect image on top of the provided image.
 *
 * @param image - The image URL or Buffer to process.
 * @returns A Promise resolving with a Buffer containing the processed PNG image.
 * @throws If no image is provided, if the image is invalid, or if image processing fails.
 */
export const invert = async (image: ImageInput): Promise<Buffer> => {
	if (!image) {
		throw new Error("You must provide an image as the first argument.");
	}

	const isValid = await validateURL(image);
	if (!isValid) {
		throw new Error("You must provide a valid image URL or buffer.");
	}

	try {
		const jimpImage = await Jimp.read(image);
		jimpImage.invert();

		const buffer = await jimpImage.getBuffer("image/png");
		return buffer;
	} catch (error) {
		throw new Error(`Failed to process image: ${error}`);
	}
};
