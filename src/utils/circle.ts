/** @format */

import { Jimp } from "jimp";
import type { ImageInput } from "../types";
import { validateURL } from "./utils";
export default class Circle {
	/**
	 * Converts an image into a circular shape.
	 *
	 * @param image - The image URL or Buffer to process.
	 * @returns A Promise that resolves with a Buffer containing the processed PNG image.
	 * @throws Will throw an error if the image is invalid or if processing fails.
	 */
	async getImage(image: ImageInput): Promise<Buffer | null> {
		if (!image) {
			throw new Error("You must provide an image as the first argument.");
		}

		const isValid = await validateURL(image);
		if (!isValid) {
			throw new Error("You must provide a valid image URL or buffer.");
		}

		try {
			const jimpImage = await Jimp.read(image);
			jimpImage.resize({ w: 480, h: 480 });
			jimpImage.circle();

			// Use the async method to get the Buffer.
			const buffer = await jimpImage.getBuffer("image/png");
			return buffer;
		} catch (error) {
			throw new Error(`Failed to process the image: ${error}`);
		}
	}
}
