/** @format */

import { Jimp } from "jimp";
import type { ImageInput } from "../types";
import { validateURL } from "./utils";
export default class Mirror {
	/**
	 * Mirrors an image horizontally (or vertically)
	 * @param image - The image URL or buffer to process
	 * @param horizontal - Whether to flip horizontally (default: true)
	 * @param vertical - Whether to flip vertically (default: false)
	 * @returns A promise that resolves to a Buffer containing the processed image.
	 */
	async getImage(
		image: ImageInput,
		horizontal = true,
		vertical = false,
	): Promise<Buffer> {
		if (!image) {
			throw new Error("You must provide an image as the first argument.");
		}

		const isValid = await validateURL(image);
		if (!isValid) {
			throw new Error("You must provide a valid image URL or buffer.");
		}

		// Use Jimp's read function to load the image.
		const jimpImage = await Jimp.read(image);

		// Flip the image horizontally and/or vertically.
		jimpImage.flip({ horizontal, vertical });

		const buffer = await jimpImage.getBuffer("image/png");
		return buffer;
	}
}
