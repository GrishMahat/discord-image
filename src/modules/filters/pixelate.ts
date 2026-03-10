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
 * Applies a pixelation effect to an image
 * @param image - The image URL or buffer to pixelate
 * @param pixelSize - Size of pixels (1-50, default: 5)
 * @returns Promise<Buffer> - The pixelated image
 */
export async function pixelate(
	image: ImageInput,
	pixelSize: number = 5,
): Promise<Buffer> {
	return ErrorHandler.withErrorHandling(async () => {
		ErrorHandler.validateRequired(image, "image");
		ErrorHandler.validateRange(pixelSize, 1, 50, "pixel size");

		const imageBuffer = await validateURL(image);
		if (!imageBuffer) {
			throw new ValidationError("Failed to load image", "image", image);
		}

		try {
			const img = await Jimp.read(imageBuffer);
			img.pixelate(pixelSize);
			const buffer = await img.getBuffer("image/png");

			if (!buffer || buffer.length === 0) {
				throw new ImageProcessingError(
					"Generated image buffer is empty",
					"pixelate export",
				);
			}

			return buffer;
		} catch (error) {
			if (error instanceof ImageProcessingError) {
				throw error;
			}
			if (error instanceof Error) {
				throw new ImageProcessingError(
					`Failed to pixelate image: ${error.message}`,
					"pixelate",
					{ pixelSize },
				);
			}
			throw error;
		}
	}, "pixelate filter");
}
