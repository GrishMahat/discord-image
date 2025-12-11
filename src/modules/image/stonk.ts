/** @format */

import type { ImageInput } from "../../types";
import { createCanvas, loadImage } from "../../utils/canvas-compat";
import {
	ErrorHandler,
	FileSystemError,
	ImageProcessingError,
	ValidationError,
} from "../../utils/errors";
import { getAssetPath } from "../../utils/paths";
import { validateURL } from "../../utils/utils";

/**
 * Add a stonk meme to an image
 * @param image - The image URL or buffer to add the stonk meme to
 * @returns Buffer containing the processed image
 */
export const stonk = async (image: ImageInput): Promise<Buffer> => {
	return ErrorHandler.withErrorHandling(async () => {
		ErrorHandler.validateRequired(image, "image");

		const imageBuffer = await validateURL(image);
		if (!imageBuffer) {
			throw new ValidationError("Failed to load image", "image", image);
		}

		try {
			const canvas = createCanvas(900, 539);
			const ctx = canvas.getContext("2d");

			// Load and draw the user image
			const userImage = await loadImage(imageBuffer);
			ctx.drawImage(userImage, 70, 40, 240, 240);

			// Load and draw the stonk background
			const templatePath = getAssetPath("stonk.png");
			const background = await loadImage(templatePath).catch((error: any) => {
				throw new FileSystemError(
					`Failed to load stonk template: ${error.message}`,
					templatePath,
					"loadTemplate",
				);
			});
			ctx.drawImage(background, 0, 0, 900, 539);

			const buffer = canvas.toBuffer("image/png");
			if (!buffer || buffer.length === 0) {
				throw new ImageProcessingError(
					"Generated image buffer is empty",
					"stonk export",
				);
			}

			return buffer;
		} catch (error) {
			if (
				error instanceof ValidationError ||
				error instanceof ImageProcessingError ||
				error instanceof FileSystemError
			) {
				throw error;
			}
			if (error instanceof Error) {
				throw new ImageProcessingError(
					`Failed to create stonk meme: ${error.message}`,
					"stonk",
					{ imageSize: imageBuffer.length },
				);
			}
			throw error;
		}
	}, "stonk meme generator");
};
