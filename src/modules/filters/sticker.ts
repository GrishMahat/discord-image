/** @format */

import { Jimp } from "jimp";
import type { ImageInput } from "../../types";
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
	if (!image) {
		throw new Error("You must provide an image as the first argument.");
	}

	const isValid = await validateURL(image);
	if (!isValid) {
		throw new Error("You must provide a valid image URL or buffer.");
	}

	if (borderSize < 5 || borderSize > 50) {
		throw new Error("Border size must be between 5 and 50.");
	}

	try {
		// Load and process the original image
		const jimpImage = await Jimp.read(image);
		const width = jimpImage.bitmap.width;
		const height = jimpImage.bitmap.height;

		// Add 10px padding to account for shadow
		const shadowPadding = 10;
		const totalPadding = borderSize + shadowPadding;

		// Create a new canvas with padding for border and shadow
		const canvas = new Jimp({
			width: width + totalPadding * 2,
			height: height + totalPadding * 2,
			color: 0x00000000, // Transparent background
		});

		// Create white border layer
		const borderLayer = new Jimp({
			width: width + borderSize * 2,
			height: height + borderSize * 2,
			color: 0xffffffff, // White
		});

		// Create shadow layer and set it to black with opacity
		const shadowLayer = new Jimp({
			width: width + borderSize * 2,
			height: height + borderSize * 2,
			color: 0x00000000, // Transparent
		});

		// Apply a black color with opacity
		shadowLayer.opacity(0.3);
		for (let x = 0; x < shadowLayer.bitmap.width; x++) {
			for (let y = 0; y < shadowLayer.bitmap.height; y++) {
				shadowLayer.setPixelColor(0x000000ff, x, y);
			}
		}

		// Composite shadow first (offset down and right)
		canvas.composite(shadowLayer, shadowPadding, shadowPadding);

		// Composite white border
		canvas.composite(
			borderLayer,
			shadowPadding - 5, // Slight offset to position border over shadow
			shadowPadding - 5,
		);

		// Composite the original image in the center of the white border
		canvas.composite(
			jimpImage,
			totalPadding - 5, // Center within border with shadow offset
			totalPadding - 5,
		);

		// Add slight blur to the shadow
		canvas.blur(1);

		const buffer = await canvas.getBuffer("image/png");
		return buffer;
	} catch (error) {
		throw new Error(`Failed to process image: ${error}`);
	}
};
