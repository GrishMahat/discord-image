/** @format */

import { createCanvas } from "./canvas-compat";
import { ErrorHandler, ImageProcessingError, ValidationError } from "./errors";

/**
 * Class for generating a solid color image.
 */
export default class Color {
	/**
	 * Creates a new image filled with the specified color.
	 *
	 * @param color - A valid CSS color (e.g. "#FFFFFF", "rgb(255,255,255)") to fill the image with. Defaults to white.
	 * @param width - The width of the image in pixels. Defaults to 480.
	 * @param height - The height of the image in pixels. Defaults to 480.
	 * @returns A Promise resolving with a Buffer containing the generated PNG image.
	 */
	async getImage(
		color: string = "#FFFFFF",
		width: number = 480,
		height: number = 480,
	): Promise<Buffer> {
		return ErrorHandler.withErrorHandling(async () => {
			ErrorHandler.validateRequired(color, "color", "string");
			ErrorHandler.validateRange(width, 1, 4096, "width");
			ErrorHandler.validateRange(height, 1, 4096, "height");

			if (!isValidCanvasColor(color)) {
				throw new ValidationError("Invalid CSS color format", "color", color);
			}

			try {
				const canvas = createCanvas(width, height);
				const ctx = canvas.getContext("2d");

				ctx.fillStyle = color;
				ctx.fillRect(0, 0, width, height);

				const buffer = canvas.toBuffer("image/png");
				if (!buffer || buffer.length === 0) {
					throw new ImageProcessingError(
						"Generated image buffer is empty",
						"color export",
					);
				}

				return buffer;
			} catch (error) {
				if (error instanceof ImageProcessingError) {
					throw error;
				}

				if (error instanceof Error) {
					throw new ImageProcessingError(
						`Failed to generate color image: ${error.message}`,
						"color",
						{ color, width, height },
					);
				}

				throw error;
			}
		}, "color utility");
	}
}

function isValidCanvasColor(input: string): boolean {
	const canvas = createCanvas(1, 1);
	const ctx = canvas.getContext("2d");

	const sentinel = "#010203";
	ctx.fillStyle = sentinel;
	ctx.fillStyle = input;

	return ctx.fillStyle !== sentinel;
}
