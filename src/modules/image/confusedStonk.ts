import { Jimp } from "jimp";
import type { ImageInput } from "../../types";
import { getAssetPath } from "../../utils/paths";
import { validateURL } from "../../utils/utils";

export const confusedStonk = async (image: ImageInput): Promise<Buffer> => {
	try {
		if (!image) {
			throw new Error("Image is required");
		}

		const isValid = await validateURL(image);
		if (!isValid) {
			throw new Error("Invalid URL provided");
		}

		// Load and prepare the user's image
		const image1 = await Jimp.read(image);
		image1.resize({ w: 400, h: 400 });

		// Load the background image
		const background = await Jimp.read(getAssetPath("confusedStonk.png"));

		// Create composite image with background dimensions
		const compositeImage = new Jimp({
			width: background.bitmap.width,
			height: background.bitmap.height,
			color: 0xffffffff,
		});

		// Composite images together
		compositeImage.composite(image1, 190, 70);
		compositeImage.composite(background, 0, 0);

		return await compositeImage.getBuffer("image/png");
	} catch (error) {
		console.error("Error creating confused stonk effect:", error);
		throw new Error(`Failed to create confused stonk effect: ${error}`);
	}
};
