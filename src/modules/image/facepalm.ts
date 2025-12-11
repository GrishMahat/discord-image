import { Jimp } from "jimp";
import type { ImageInput } from "../../types";
import { getAssetPath } from "../../utils/paths";
import { validateURL } from "../../utils/utils";

/**
 * Add a facepalm effect to an image
 * @param image - The image URL or buffer to add the facepalm effect to
 * @returns Buffer containing the processed image
 */
export const facepalm = async (image: ImageInput): Promise<Buffer> => {
	try {
		if (!image) {
			throw new Error("Image is required");
		}

		const isValid = await validateURL(image);
		if (!isValid) {
			throw new Error("Invalid URL provided");
		}

		// Load the background facepalm image
		const bg = await Jimp.read(getAssetPath("facepalm.png"));

		// Load and resize the user's avatar
		const avatar = await Jimp.read(image);
		const compositeImage = new Jimp({
			width: bg.bitmap.width,
			height: bg.bitmap.height,
			color: 0xffffffff,
		});

		// Resize avatar to match background dimensions
		avatar.resize({ w: bg.bitmap.width, h: bg.bitmap.height });

		// Composite the images together
		compositeImage.composite(avatar, 199, 112);
		compositeImage.composite(bg, 0, 0);

		return await compositeImage.getBuffer("image/png");
	} catch (error) {
		console.error("Error creating facepalm effect:", error);
		throw new Error(`Failed to create facepalm effect: ${error}`);
	}
};
