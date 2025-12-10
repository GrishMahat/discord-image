import { Jimp } from "jimp";
import type { ImageInput } from "../../types";
import { validateURL } from "../../utils/utils";

/**
 * Add a spank meme to an image
 * @param image - The first image to add to the spank meme
 * @param image2 - The second image to add to the spank meme
 * @returns Buffer containing the processed image
 */
export const spank = async (
	image: ImageInput,
	image2: ImageInput,
): Promise<Buffer> => {
	try {
		// Validate inputs
		if (!image || !image2) {
			throw new Error("Both images are required");
		}

		const [isValid1, isValid2] = await Promise.all([
			validateURL(image),
			validateURL(image2),
		]);

		if (!isValid1 || !isValid2) {
			throw new Error("Invalid URL provided");
		}

		// Load images
		const [bg, userImage1, userImage2] = await Promise.all([
			Jimp.read(`${__dirname}/../../assets/spank.png`),
			Jimp.read(image),
			Jimp.read(image2),
		]);

		// Process background
		bg.resize({ w: 500, h: 500 });

		// Process first user image
		userImage1.circle().greyscale().resize({ w: 140, h: 140 });

		// Process second user image
		userImage2.circle().greyscale().resize({ w: 120, h: 120 });

		// Composite images
		bg.composite(userImage2, 350, 220).composite(userImage1, 225, 5);

		return await bg.getBuffer("image/png");
	} catch (error) {
		console.error("Error creating spank meme:", error);
		throw new Error(`Failed to create spank meme: ${error}`);
	}
};
