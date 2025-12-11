/** @format */

import { Jimp } from "jimp";
import type { ImageInput } from "../../types";
import { getAssetPath } from "../../utils/paths";
import { validateURL } from "../../utils/utils";

/**
 * Creates a "Not Stonk" meme using the provided image
 * @param image - The image URL or buffer to process
 * @returns Promise<Buffer> - The generated meme image
 */
export const notStonk = async (image: ImageInput): Promise<Buffer> => {
	if (!image) {
		throw new Error("You must provide an image as the first argument.");
	}

	const isValid = await validateURL(image);
	if (!isValid) {
		throw new Error("You must provide a valid image URL or buffer.");
	}

	try {
		const canvas = new Jimp({ width: 960, height: 576 });
		const userImage = await Jimp.read(image);
		const background = await Jimp.read(getAssetPath("notStonk.png"));

		userImage.resize({ w: 190, h: 190 });
		background.resize({ w: 960, h: 576 });

		canvas.composite(userImage, 140, 5);
		canvas.composite(background, 0, 0);

		return await canvas.getBuffer("image/png");
	} catch (error) {
		console.error("Error creating notStonk meme:", error);
		throw new Error(`Failed to create notStonk meme: ${error}`);
	}
};
