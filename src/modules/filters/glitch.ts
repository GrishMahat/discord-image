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
 * Helper to safely create a color value as unsigned 32-bit
 */
function rgba(r: number, g: number, b: number, a: number): number {
	return (
		(((r & 0xff) << 24) |
			((g & 0xff) << 16) |
			((b & 0xff) << 8) |
			(a & 0xff)) >>>
		0
	);
}

/**
 * Extract RGBA components from a pixel
 */
function extractRGBA(pixel: number): {
	r: number;
	g: number;
	b: number;
	a: number;
} {
	return {
		r: (pixel >>> 24) & 0xff,
		g: (pixel >>> 16) & 0xff,
		b: (pixel >>> 8) & 0xff,
		a: pixel & 0xff,
	};
}

/**
 * Applies a digital glitch effect to an image
 * @param image - The image URL or buffer to apply the glitch effect to
 * @param intensity - The intensity of the glitch effect (1-10)
 * @returns Promise<Buffer> - The generated glitched image
 */
export const glitch = async (
	image: ImageInput,
	intensity: number = 5,
): Promise<Buffer> => {
	return ErrorHandler.withErrorHandling(async () => {
		ErrorHandler.validateRequired(image, "image");

		const imageBuffer = await validateURL(image);
		if (!imageBuffer) {
			throw new ValidationError("Failed to load image", "image", image);
		}

		if (intensity < 1 || intensity > 10) {
			throw new ValidationError(
				"Intensity must be between 1 and 10",
				"intensity",
				intensity,
			);
		}

		try {
			const jimpImage = await Jimp.read(imageBuffer);

			// Scale intensity to practical values
			const rgbOffset = Math.floor((intensity / 10) * 15);
			const corruptionChance = intensity / 20;
			const scanlineCount = Math.floor((intensity / 10) * 10) + 1;

			const width = jimpImage.bitmap.width;
			const height = jimpImage.bitmap.height;

			// Create copies for RGB channels
			const redChannel = jimpImage.clone();
			const blueChannel = jimpImage.clone();

			// Apply chromatic aberration (RGB offset effect)
			for (let y = 0; y < height; y++) {
				for (let x = 0; x < width; x++) {
					// Red channel offset
					if (x + rgbOffset < width) {
						const redPixel = redChannel.getPixelColor(x + rgbOffset, y);
						const originalPixel = jimpImage.getPixelColor(x, y);

						const redRgba = extractRGBA(redPixel);
						const origRgba = extractRGBA(originalPixel);

						const newColor = rgba(
							redRgba.r,
							origRgba.g,
							origRgba.b,
							origRgba.a,
						);
						jimpImage.setPixelColor(newColor, x, y);
					}

					// Blue channel offset
					if (x - rgbOffset >= 0) {
						const bluePixel = blueChannel.getPixelColor(x - rgbOffset, y);
						const currentPixel = jimpImage.getPixelColor(x, y);

						const blueRgba = extractRGBA(bluePixel);
						const currRgba = extractRGBA(currentPixel);

						const newColor = rgba(
							currRgba.r,
							currRgba.g,
							blueRgba.b,
							currRgba.a,
						);
						jimpImage.setPixelColor(newColor, x, y);
					}
				}
			}

			// Add random horizontal corruption lines
			const corruptionLines = Math.floor(height * corruptionChance);
			for (let i = 0; i < corruptionLines; i++) {
				const y = Math.floor(Math.random() * height);
				const corruptionLength = Math.floor(Math.random() * (width * 0.3)) + 5;
				const startX = Math.floor(Math.random() * (width - corruptionLength));
				const displacement = Math.floor(Math.random() * 20) - 10;

				for (let x = startX; x < startX + corruptionLength; x++) {
					const srcX = x + displacement;
					if (srcX >= 0 && srcX < width) {
						const pixelColor = jimpImage.getPixelColor(srcX, y);
						jimpImage.setPixelColor(pixelColor, x, y);
					}
				}
			}

			// Add scanlines
			for (let i = 0; i < scanlineCount; i++) {
				const y = Math.floor(Math.random() * height);
				for (let x = 0; x < width; x++) {
					const pixel = jimpImage.getPixelColor(x, y);
					const { r, g, b, a } = extractRGBA(pixel);

					// Brighten scanline
					const boost = 40;
					const newColor = rgba(
						Math.min(r + boost, 255),
						Math.min(g + boost, 255),
						Math.min(b + boost, 255),
						a,
					);
					jimpImage.setPixelColor(newColor, x, y);
				}
			}

			const buffer = await jimpImage.getBuffer("image/png");

			if (!buffer || buffer.length === 0) {
				throw new ImageProcessingError(
					"Generated image buffer is empty",
					"glitch export",
				);
			}

			return buffer;
		} catch (error) {
			if (
				error instanceof ValidationError ||
				error instanceof ImageProcessingError
			) {
				throw error;
			}
			if (error instanceof Error) {
				throw new ImageProcessingError(
					`Failed to apply glitch effect: ${error.message}`,
					"glitch",
				);
			}
			throw error;
		}
	}, "glitch filter");
};
