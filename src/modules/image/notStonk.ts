/** @format */

import { Jimp } from "jimp";
import type { ImageInput } from "../../types";
import {
	ErrorHandler,
	ImageProcessingError,
	ValidationError,
} from "../../utils/errors";
import { getAssetPath } from "../../utils/paths";
import { validateURL } from "../../utils/utils";

/**
 * Creates a "Not Stonk" meme using the provided image
 * @param image - The image URL or buffer to process
 * @returns Promise<Buffer> - The generated meme image
 */
export const notStonk = async (image: ImageInput): Promise<Buffer> => {
	return ErrorHandler.withErrorHandling(async () => {
		ErrorHandler.validateRequired(image, "image");

		const imageBuffer = await validateURL(image);
		if (!imageBuffer) {
			throw new ValidationError("Failed to load image", "image", image);
		}

		try {
			const canvas = new Jimp({ width: 960, height: 576 });
			const userImage = await Jimp.read(imageBuffer);
			const background = await Jimp.read(getAssetPath("notStonk.png"));

			userImage.resize({ w: 190, h: 190 });
			background.resize({ w: 960, h: 576 });

			canvas.composite(userImage, 140, 5);
			canvas.composite(background, 0, 0);

			const buffer = await canvas.getBuffer("image/png");
			if (!buffer || buffer.length === 0) {
				throw new ImageProcessingError(
					"Generated image buffer is empty",
					"notStonk export",
				);
			}

			return buffer;
		} catch (error) {
			if (error instanceof ImageProcessingError) {
				throw error;
			}
			if (error instanceof Error) {
				throw new ImageProcessingError(
					`Failed to create notStonk meme: ${error.message}`,
					"notStonk",
				);
			}
			throw error;
		}
	}, "notStonk image generator");
};
