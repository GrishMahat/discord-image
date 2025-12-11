/** @format */

import { Jimp } from "jimp";
import type { ImageInput } from "../../types";
import {
	ErrorHandler,
	ImageProcessingError,
	ValidationError,
} from "../../utils/errors";
import { validateURL } from "../../utils/utils";

/**
 * Applies a sepia filter to an image
 * @param image - The image URL or buffer to apply the sepia filter to
 * @returns Promise<Buffer> - The generated sepia image
 */
export const sepia = async (image: ImageInput): Promise<Buffer> => {
	return ErrorHandler.withErrorHandling(async () => {
		ErrorHandler.validateRequired(image, "image");

		const imageBuffer = await validateURL(image);
		if (!imageBuffer) {
			throw new ValidationError("Failed to load image", "image", image);
		}

		try {
			const jimpImage = await Jimp.read(imageBuffer);
			jimpImage.sepia();
			const buffer = await jimpImage.getBuffer("image/png");

			if (!buffer || buffer.length === 0) {
				throw new ImageProcessingError(
					"Generated image buffer is empty",
					"sepia export",
				);
			}

			return buffer;
		} catch (error) {
			if (
				error instanceof ValidationError ||
				error instanceof ImageProcessingError
			) {
				throw error;
			}
			if (error instanceof Error) {
				throw new ImageProcessingError(
					`Failed to apply sepia effect: ${error.message}`,
					"sepia",
					{ imageSize: imageBuffer.length },
				);
			}
			throw error;
		}
	}, "sepia filter");
};
