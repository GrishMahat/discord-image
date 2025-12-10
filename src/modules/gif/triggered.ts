/** @format */

import GIFEncoder from "gifencoder";
import type { ImageInput } from "../../types";
import { createCanvas, loadImage } from "../../utils/canvas-compat";
import {
	ErrorHandler,
	FileSystemError,
	ImageProcessingError,
	ValidationError,
} from "../../utils/errors";
import { validateURL } from "../../utils/utils";

/**
 * Creates a "triggered" GIF effect on an image
 * @param image - Image URL or buffer to apply effect to
 * @param timeout - Delay between frames in milliseconds (default: 15)
 * @returns Buffer containing the generated GIF
 */
export const triggered = async (
	image: ImageInput,
	timeout: number = 15,
): Promise<Buffer> => {
	return ErrorHandler.withErrorHandling(async () => {
		// Validate inputs
		ErrorHandler.validateRequired(image, "image");
		ErrorHandler.validateRange(timeout, 1, 1000, "frame timeout");

		// Validate and fetch image
		const imageBuffer = await validateURL(image);
		if (!imageBuffer) {
			throw new ValidationError("Failed to load image", "image", image);
		}

		try {
			// Load template path
			const templatePath = "../../assets/triggered.png";

			// Load images with error handling
			const [base, img] = await Promise.all([
				loadImage(templatePath).catch((error: any) => {
					throw new FileSystemError(
						`Failed to load triggered template: ${error.message}`,
						templatePath,
						"loadTemplate",
					);
				}),
				loadImage(imageBuffer).catch((error: any) => {
					throw new ImageProcessingError(
						`Failed to load source image: ${error.message}`,
						"loadSourceImage",
						{ imageSize: imageBuffer.length },
					);
				}),
			]);

			// Initialize GIF encoder
			const GIF = new GIFEncoder(256, 310);
			GIF.start();
			GIF.setRepeat(0); // Loop forever
			GIF.setDelay(timeout);

			// Create canvas
			const canvas = createCanvas(256, 310);
			const ctx = canvas.getContext("2d");

			// Constants for random offsets
			const BACKGROUND_RANGE = 20; // Range for background image shake
			const LABEL_RANGE = 10; // Range for "triggered" label shake

			// Generate frames
			for (let i = 0; i < 9; i++) {
				try {
					// Clear previous frame
					ctx.clearRect(0, 0, 256, 310);

					// Draw shaking background image
					ctx.drawImage(
						img,
						Math.floor(Math.random() * BACKGROUND_RANGE) - BACKGROUND_RANGE,
						Math.floor(Math.random() * BACKGROUND_RANGE) - BACKGROUND_RANGE,
						256 + BACKGROUND_RANGE,
						310 - 54 + BACKGROUND_RANGE,
					);

					// Add red overlay
					ctx.fillStyle = "#FF000033";
					ctx.fillRect(0, 0, 256, 310);

					// Draw shaking "triggered" label
					ctx.drawImage(
						base,
						Math.floor(Math.random() * LABEL_RANGE) - LABEL_RANGE,
						310 - 54 + Math.floor(Math.random() * LABEL_RANGE) - LABEL_RANGE,
						256 + LABEL_RANGE,
						54 + LABEL_RANGE,
					);

					GIF.addFrame(ctx as unknown as CanvasRenderingContext2D);
				} catch (_error) {
					throw new ImageProcessingError(
						`Failed to generate frame ${i + 1}`,
						"frameGeneration",
						{ frameIndex: i, totalFrames: 9 },
					);
				}
			}

			// Finalize GIF
			try {
				GIF.finish();
				const buffer = GIF.out.getData();

				if (!buffer || buffer.length === 0) {
					throw new ImageProcessingError(
						"Generated GIF buffer is empty",
						"gifExport",
					);
				}

				return buffer;
			} catch (_error) {
				throw new ImageProcessingError(
					"Failed to finalize GIF",
					"gifFinalization",
					{ frameCount: 9, timeout },
				);
			}
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
					`Failed to create triggered GIF: ${error.message}`,
					"triggered",
					{ timeout, imageSize: imageBuffer.length },
				);
			}

			throw error;
		}
	}, "triggered GIF generator");
};
