/** @format */

import { Jimp } from "jimp";
import type { ImageInput } from "../../types";
import { validateURL } from "../../utils/utils";

export const bobross = async (image: ImageInput): Promise<Buffer> => {
	if (!image) {
		throw new Error("Image is required");
	}
	const isValid = await validateURL(image);
	if (!isValid) {
		throw new Error("Invalid URL provided");
	}

	const base = await Jimp.read(`${__dirname}/../../assets/bobross.png`);
	const imageBuffer = await Jimp.read(image);
	imageBuffer.resize({ w: 440, h: 440 });
	const compositeImage = new Jimp({
		width: base.bitmap.width,
		height: base.bitmap.height,
		color: 0xffffffff,
	});
	compositeImage.composite(imageBuffer, 15, 20);
	compositeImage.composite(base, 0, 0);
	return await compositeImage.getBuffer("image/png");
};
