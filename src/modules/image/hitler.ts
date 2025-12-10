import { Jimp } from "jimp";
import type { ImageInput } from "../../types";
import { validateURL } from "../../utils/utils";

/**
 * Creates a Hitler meme from an image
 * @param image - The image URL or buffer to use
 * @returns Promise<Buffer> - The generated Hitler meme image
 */
export const hitler = async (image: ImageInput): Promise<Buffer> => {
	if (!image) {
		throw new Error("You must provide an image as the first argument.");
	}

	const isValid = await validateURL(image);
	if (!isValid) {
		throw new Error("You must provide a valid image URL or buffer.");
	}

	try {
		const bg = await Jimp.read(`${__dirname}/../../assets/hitler.png`);
		const img = await Jimp.read(image);

		img.resize({ w: 140, h: 140 });
		bg.composite(img, 46, 43);

		return await bg.getBuffer("image/png");
	} catch (error) {
		throw new Error(`Failed to process image: ${error}`);
	}
};
