/** @format */
import { Jimp } from "jimp";
import type { ImageInput } from "../../types";
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
	if (!image) {
		throw new Error("Image is required");
	}

	const isValid = await validateURL(image);
	if (!isValid) {
		throw new Error("Invalid URL provided");
	}

	if (amplitude < 1 || amplitude > 50) {
		throw new Error("Amplitude must be between 1 and 50");
	}

	if (frequency < 1 || frequency > 20) {
		throw new Error("Frequency must be between 1 and 20");
	}

	try {
		const img = await Jimp.read(image as string);
		const width = img.bitmap.width;
		const height = img.bitmap.height;

		// Create a new image for the wave effect
		const output = new Jimp({ width: width, height: height });

		// Apply wave distortion
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				// Calculate wave offset
				const xOffset = Math.sin(y / frequency) * amplitude;
				const yOffset = Math.cos(x / frequency) * amplitude;

				// Get source pixel coordinates with wave distortion
				const sourceX = Math.floor(x + xOffset);
				const sourceY = Math.floor(y + yOffset);

				// Ensure coordinates are within bounds
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

		return await output.getBuffer("image/png");
	} catch (error) {
		throw new Error(`Failed to apply wave effect: ${error}`);
	}
}
