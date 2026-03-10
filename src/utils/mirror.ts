/** @format */

import { Jimp } from "jimp";
import type { ImageInput } from "../types";
import { ErrorHandler, ImageProcessingError, ValidationError } from "./errors";
import { validateURL } from "./utils";

export default class Mirror {
	/**
	 * Mirrors an image horizontally (or vertically)
	 * @param image - The image URL or buffer to process
	 * @param horizontal - Whether to flip horizontally (default: true)
	 * @param vertical - Whether to flip vertically (default: false)
	 * @returns A promise that resolves to a Buffer containing the processed image.
	 */
	async getImage(
		image: ImageInput,
		horizontal = true,
		vertical = false,
	): Promise<Buffer> {
		return ErrorHandler.withErrorHandling(async () => {
			ErrorHandler.validateRequired(image, "image");
			ErrorHandler.validateRequired(horizontal, "horizontal", "boolean");
			ErrorHandler.validateRequired(vertical, "vertical", "boolean");

			if (!horizontal && !vertical) {
				throw new ValidationError(
					"At least one mirror direction must be enabled",
					"horizontal|vertical",
					{ horizontal, vertical },
				);
			}

			const imageBuffer = await validateURL(image);
			if (!imageBuffer) {
				throw new ValidationError("Failed to load image", "image", image);
			}

			try {
				const jimpImage = await Jimp.read(imageBuffer);
				jimpImage.flip({ horizontal, vertical });

				const buffer = await jimpImage.getBuffer("image/png");
				if (!buffer || buffer.length === 0) {
					throw new ImageProcessingError(
						"Generated image buffer is empty",
						"mirror export",
					);
				}

				return buffer;
			} catch (error) {
				if (error instanceof ImageProcessingError) {
					throw error;
				}

				if (error instanceof Error) {
					throw new ImageProcessingError(
						`Failed to mirror image: ${error.message}`,
						"mirror",
						{ horizontal, vertical },
					);
				}

				throw error;
			}
		}, "mirror utility");
	}
}
