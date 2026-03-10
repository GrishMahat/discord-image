/** @format */

import { Jimp } from "jimp";
import type { ImageInput } from "../types";
import { ErrorHandler, ImageProcessingError, ValidationError } from "./errors";
import { validateURL } from "./utils";

export default class Denoise {
	/**
	 * Denoises an image using a gaussian filter.
	 * @param image - The image URL or Buffer to process.
	 * @param level - The intensity level for denoising (must be between 1 and 10; default is 1).
	 * @returns A Promise that resolves with a Buffer containing the processed image.
	 * @throws Will throw an error if the image is invalid or if level is out of range.
	 */
	async getImage(image: ImageInput, level: number = 5): Promise<Buffer> {
		return ErrorHandler.withErrorHandling(async () => {
			ErrorHandler.validateRequired(image, "image");
			ErrorHandler.validateRange(level, 1, 10, "denoise level");

			const imageBuffer = await validateURL(image);
			if (!imageBuffer) {
				throw new ValidationError("Failed to load image", "image", image);
			}

			try {
				const jimpImage = await Jimp.read(imageBuffer);
				jimpImage.gaussian(level);

				const buffer = await jimpImage.getBuffer("image/png");
				if (!buffer || buffer.length === 0) {
					throw new ImageProcessingError(
						"Generated image buffer is empty",
						"denoise export",
					);
				}

				return buffer;
			} catch (error) {
				if (error instanceof ImageProcessingError) {
					throw error;
				}

				if (error instanceof Error) {
					throw new ImageProcessingError(
						`Failed to denoise image: ${error.message}`,
						"denoise",
						{ level },
					);
				}

				throw error;
			}
		}, "denoise utility");
	}
}
