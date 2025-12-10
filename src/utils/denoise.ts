/** @format */

import { Jimp } from "jimp";
import { validateURL } from "./utils";

type ImageInput = string | Buffer;

export default class Denoise {
	/**
	 * Denoises an image using a gaussian filter.
	 * @param image - The image URL or Buffer to process.
	 * @param level - The intensity level for denoising (must be between 1 and 10; default is 1).
	 * @returns A Promise that resolves with a Buffer containing the processed image.
	 * @throws Will throw an error if the image is invalid or if level is out of range.
	 */
	async getImage(image: ImageInput, level: number = 5): Promise<Buffer> {
		if (!image) {
			throw new Error("You must provide an image as the first argument.");
		}

		const isValid = await validateURL(image);
		if (!isValid) {
			throw new Error("You must provide a valid image URL or buffer.");
		}

		if (level < 1 || level > 10) {
			throw new Error("Level must be between 1 and 10.");
		}

		try {
			const jimpImage = await Jimp.read(image);
			jimpImage.gaussian(level);

			const buffer = await jimpImage.getBuffer("image/png");
			return buffer;
		} catch (error) {
			throw new Error(`Failed to process the image: ${error}`);
		}
	}
}
