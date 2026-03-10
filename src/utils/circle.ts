/** @format */

import { Jimp } from "jimp";
import type { ImageInput } from "../types";
import { ErrorHandler, ImageProcessingError, ValidationError } from "./errors";
import { validateURL } from "./utils";

export default class Circle {
	/**
	 * Converts an image into a circular shape.
	 *
	 * @param image - The image URL or Buffer to process.
	 * @returns A Promise that resolves with a Buffer containing the processed PNG image.
	 * @throws Will throw an error if the image is invalid or if processing fails.
	 */
	async getImage(image: ImageInput): Promise<Buffer> {
		return ErrorHandler.withErrorHandling(async () => {
			ErrorHandler.validateRequired(image, "image");

			const imageBuffer = await validateURL(image);
			if (!imageBuffer) {
				throw new ValidationError("Failed to load image", "image", image);
			}

			try {
				const jimpImage = await Jimp.read(imageBuffer);
				jimpImage.resize({ w: 480, h: 480 });
				jimpImage.circle();

				const buffer = await jimpImage.getBuffer("image/png");
				if (!buffer || buffer.length === 0) {
					throw new ImageProcessingError(
						"Generated image buffer is empty",
						"circle export",
					);
				}

				return buffer;
			} catch (error) {
				if (error instanceof ImageProcessingError) {
					throw error;
				}

				if (error instanceof Error) {
					throw new ImageProcessingError(
						`Failed to create circular image: ${error.message}`,
						"circle",
					);
				}

				throw error;
			}
		}, "circle utility");
	}
}
