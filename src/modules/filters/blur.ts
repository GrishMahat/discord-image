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
 * Applies a blur effect to an image
 * @param image - The image URL or buffer to apply the blur effect to
 * @param level - The level of blur to apply (1-10)
 * @returns Promise<Buffer> - The generated blurred image
 */
export const blur = async (
	image: ImageInput,
	level: number = 10,
): Promise<Buffer> => {
	return ErrorHandler.withErrorHandling(async () => {
		// Validate inputs
		ErrorHandler.validateRequired(image, "image");
		ErrorHandler.validateRange(level, 1, 10, "blur level");

		// Validate and fetch image
		const imageBuffer = await validateURL(image);
		if (!imageBuffer) {
			throw new ValidationError("Failed to load image", "image", image);
		}

		try {
			// Process image with Jimp
			const jimpImage = await Jimp.read(imageBuffer);

			// Apply blur effect
			jimpImage.blur(level);

			// Export as PNG
			const buffer = await jimpImage.getBuffer("image/png");

			if (!buffer || buffer.length === 0) {
				throw new ImageProcessingError(
					"Generated image buffer is empty",
					"blur export",
				);
			}

			return buffer;
		} catch (error) {
			if (error instanceof Error) {
				throw new ImageProcessingError(
					`Failed to apply blur effect: ${error.message}`,
					"blur",
					{ level, imageSize: imageBuffer.length },
				);
			}
			throw error;
		}
	}, "blur filter");
};
