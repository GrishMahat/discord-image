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
 * Applies a sticker effect to an image (white border and drop shadow)
 * @param image - The image URL or buffer to apply the sticker effect to
 * @param borderSize - Size of the white border (5-50)
 * @returns Promise<Buffer> - The generated sticker image
 */
export const sticker = async (
	image: ImageInput,
	borderSize: number = 15,
): Promise<Buffer> => {
	return ErrorHandler.withErrorHandling(async () => {
		ErrorHandler.validateRequired(image, "image");
		ErrorHandler.validateRange(borderSize, 5, 50, "sticker border size");

		const imageBuffer = await validateURL(image);
		if (!imageBuffer) {
			throw new ValidationError("Failed to load image", "image", image);
		}

		try {
			const jimpImage = await Jimp.read(imageBuffer);
			const width = jimpImage.bitmap.width;
			const height = jimpImage.bitmap.height;

			const shadowPadding = 10;
			const totalPadding = borderSize + shadowPadding;
			const borderWidth = width + borderSize * 2;
			const borderHeight = height + borderSize * 2;

			const canvas = new Jimp({
				width: width + totalPadding * 2,
				height: height + totalPadding * 2,
				color: 0x00000000,
			});

			const borderLayer = new Jimp({
				width: borderWidth,
				height: borderHeight,
				color: 0xffffffff,
			});
			borderLayer.composite(jimpImage, borderSize, borderSize);

			// Fast shadow layer: avoid pixel-by-pixel loops.
			const shadowLayer = new Jimp({
				width: borderWidth,
				height: borderHeight,
				color: 0x00000066,
			});

			canvas.composite(shadowLayer, shadowPadding, shadowPadding);
			canvas.composite(borderLayer, shadowPadding - 5, shadowPadding - 5);

			const buffer = await canvas.getBuffer("image/png");
			if (!buffer || buffer.length === 0) {
				throw new ImageProcessingError(
					"Generated image buffer is empty",
					"sticker export",
				);
			}

			return buffer;
		} catch (error) {
			if (error instanceof ImageProcessingError) {
				throw error;
			}
			if (error instanceof Error) {
				throw new ImageProcessingError(
					`Failed to create sticker image: ${error.message}`,
					"sticker",
					{ borderSize },
				);
			}
			throw error;
		}
	}, "sticker filter");
};
