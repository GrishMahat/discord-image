/** @format */

import { Jimp } from "jimp";
import type { ImageInput } from "../../types";
import { validateURL } from "../../utils/utils";

/**
 * Add a trash can to an image
 * @param image - The image to add the trash can to
 * @returns The image with the trash can added
 */
export const trash = async (image: ImageInput): Promise<Buffer> => {
	if (!image) {
		throw new Error("Image is required");
	}

	const isValid = await validateURL(image);
	if (!isValid) {
		throw new Error("Invalid URL provided");
	}

	const background = await Jimp.read(`${__dirname}/../../assets/trash.png`);
	const userImage = await Jimp.read(image);
	userImage.resize({ h: 309, w: 309 });
	userImage.blur(5);
	background.composite(userImage, 309, 0);
	return await background.getBuffer(`image/png`);
};
