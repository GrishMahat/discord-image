/** @format */

import type { ImageInput } from "../../types";
import { createCanvas, loadImage } from "../../utils/canvas-compat";
import {
	ErrorHandler,
	FileSystemError,
	ImageProcessingError,
	ValidationError,
} from "../../utils/errors";
import { applyText, validateURL } from "../../utils/utils";

/**
 * Creates a "Wanted" poster meme from an image
 *
 * @param image - The image URL or buffer to use for the wanted poster
 * @param currency - Currency symbol for the bounty (defaults to $)
 * @param amount - Bounty amount (random if not specified)
 * @returns Promise<Buffer> - The generated wanted poster image
 */
export const wanted = async (
	image: ImageInput,
	currency: string = "$",
	amount?: number,
): Promise<Buffer> => {
	return ErrorHandler.withErrorHandling(async () => {
		// Validate inputs
		ErrorHandler.validateRequired(image, "image");
		ErrorHandler.validateStringLength(currency, 5, "currency", 1);

		// Generate random bounty amount if none provided
		if (!amount) {
			amount = Math.floor(Math.random() * 200000) + 300000;
		} else {
			ErrorHandler.validateRange(amount, 0, Number.MAX_SAFE_INTEGER, "amount");
		}

		// Validate and fetch image
		const imageBuffer = await validateURL(image);
		if (!imageBuffer) {
			throw new ValidationError("Failed to load image", "image", image);
		}

		try {
			// Set up canvas
			const canvas = createCanvas(257, 383);
			const ctx = canvas.getContext("2d");

			// Load template path
			const templatePath = "../../assets/wanted.png";

			// Load images with error handling
			const [avatar, wantedTemplate] = await Promise.all([
				loadImage(imageBuffer).catch((error) => {
					throw new ImageProcessingError(
						`Failed to load avatar image: ${error.message}`,
						"loadAvatar",
						{ imageSize: imageBuffer.length },
					);
				}),
				loadImage(templatePath).catch((error) => {
					throw new FileSystemError(
						`Failed to load wanted template: ${error.message}`,
						templatePath,
						"loadTemplate",
					);
				}),
			]);

			// Draw the suspect's image
			ctx.drawImage(avatar, 25, 60, 210, 210);

			// Overlay the wanted poster template
			ctx.drawImage(wantedTemplate, 0, 0, 257, 383);

			// Add the bounty text
			const bountyText = `${currency}${amount}`;
			ctx.textAlign = "center";
			ctx.fillStyle = "#513d34";

			// Get appropriate font size
			ctx.font = await applyText(
				canvas as unknown as {
					getContext: (
						contextId: string,
						options?: unknown,
					) => CanvasRenderingContext2D;
				},
				bountyText,
				80,
				200,
				"Times New Roman",
			);

			// Draw bounty amount
			ctx.fillText(bountyText, 128, 315);

			// Generate final image
			const buffer = canvas.toBuffer();

			if (!buffer || buffer.length === 0) {
				throw new ImageProcessingError(
					"Generated wanted poster buffer is empty",
					"canvasExport",
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
					`Failed to generate wanted poster: ${error.message}`,
					"wanted",
					{ currency, amount, imageSize: imageBuffer.length },
				);
			}

			throw error;
		}
	}, "wanted poster generator");
};
