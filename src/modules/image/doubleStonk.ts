import { Jimp } from "jimp";
import type { ImageInput } from "../../types";
import { getAssetPath } from "../../utils/paths";
import { validateURL } from "../../utils/utils";

export const doubleStonk = async (
	image: ImageInput,
	image2: ImageInput,
): Promise<Buffer> => {
	if (!image || !image2) {
		throw new Error("Image is required");
	}

	const isValid = await validateURL(image);
	const isValid2 = await validateURL(image2);
	if (!isValid || !isValid2) {
		throw new Error("Invalid URL provided");
	}

	try {
		// Load and prepare base image
		const base = await Jimp.read(getAssetPath("doubleStonk.png"));
		base.resize({ w: 577, h: 431 });

		// Load and prepare first avatar
		const avatar1 = await Jimp.read(image);
		avatar1.resize({ w: 140, h: 140 });
		avatar1.circle();

		// Load and prepare second avatar
		const avatar2 = await Jimp.read(image2);
		avatar2.resize({ w: 140, h: 140 });
		avatar2.circle();

		// Composite images together
		base.composite(avatar2, 60, 20);
		base.composite(avatar1, 0, 30);

		return await base.getBuffer("image/png");
	} catch (error) {
		console.error("Error creating double stonk effect:", error);
		throw new Error(`Failed to create double stonk effect: ${error}`);
	}
};
