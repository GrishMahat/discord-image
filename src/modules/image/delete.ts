import { Jimp } from "jimp";
import type { ImageInput } from "../../types";
import { getAssetPath } from "../../utils/paths";
import { validateURL } from "../../utils/utils";

export const Delete = async (image: ImageInput) => {
	if (!image) throw new Error("No image provided");
	if (!validateURL(image)) throw new Error("Invalid image URL");

	try {
		const background = await Jimp.read(getAssetPath("delete.png"));
		const imageToProcess = await Jimp.read(image);

		imageToProcess.resize({ w: 195, h: 195 });
		background.composite(imageToProcess, 120, 135);

		return await background.getBuffer("image/png");
	} catch {
		throw new Error(`Failed to process image: delete`);
	}
};
