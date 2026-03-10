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
 * Applies a wave effect to an image
 * @param image - The image URL or buffer to apply wave effect to
 * @param amplitude - Wave amplitude (1-50, default: 10)
 * @param frequency - Wave frequency (1-20, default: 5)
 * @returns Promise<Buffer> - The wave-distorted image
 */
export async function wave(
	image: ImageInput,
	amplitude: number = 10,
	frequency: number = 5,
): Promise<Buffer> {
	return ErrorHandler.withErrorHandling(async () => {
		ErrorHandler.validateRequired(image, "image");
		ErrorHandler.validateRange(amplitude, 1, 50, "wave amplitude");
		ErrorHandler.validateRange(frequency, 1, 20, "wave frequency");

		const imageBuffer = await validateURL(image);
		if (!imageBuffer) {
			throw new ValidationError("Failed to load image", "image", image);
		}

		try {
			const img = await Jimp.read(imageBuffer);
			const width = img.bitmap.width;
			const height = img.bitmap.height;
			const output = new Jimp({ width, height });

			for (let y = 0; y < height; y++) {
				for (let x = 0; x < width; x++) {
					const xOffset = Math.sin(y / frequency) * amplitude;
					const yOffset = Math.cos(x / frequency) * amplitude;
					const sourceX = Math.floor(x + xOffset);
					const sourceY = Math.floor(y + yOffset);

					if (
						sourceX >= 0 &&
						sourceX < width &&
						sourceY >= 0 &&
						sourceY < height
					) {
						const color = img.getPixelColor(sourceX, sourceY);
						output.setPixelColor(color, x, y);
					}
				}
			}

			const buffer = await output.getBuffer("image/png");
			if (!buffer || buffer.length === 0) {
				throw new ImageProcessingError(
					"Generated image buffer is empty",
					"wave export",
				);
			}

			return buffer;
		} catch (error) {
			if (error instanceof ImageProcessingError) {
				throw error;
			}
			if (error instanceof Error) {
				throw new ImageProcessingError(
					`Failed to apply wave effect: ${error.message}`,
					"wave",
					{ amplitude, frequency },
				);
			}
			throw error;
		}
	}, "wave filter");
}
