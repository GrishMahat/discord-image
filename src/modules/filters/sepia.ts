import { Jimp } from "jimp";
import type { ImageInput } from "../../types";
import { validateURL } from "../../utils/utils";

/**
 * Applies a sepia filter to an image
 * @param image - The image URL or buffer to apply the sepia filter to
 * @returns Promise<Buffer> - The generated sepia image
 */
export const sepia = async (image: ImageInput): Promise<Buffer> => {
	if (!image) {
		throw new Error("You must provide an image as the first argument.");
	}

	const isValid = await validateURL(image);
	if (!isValid) {
		throw new Error("You must provide a valid image URL or buffer.");
	}

	try {
		const jimpImage = await Jimp.read(image);
		jimpImage.sepia();

		const buffer = await jimpImage.getBuffer("image/png");
		return buffer;
	} catch (error) {
		throw new Error(`Failed to process the image: ${error}`);
	}
};
