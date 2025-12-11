import { Jimp } from "jimp";
import type { ImageInput } from "../../types";
import { getAssetPath } from "../../utils/paths";
import { validateURL } from "../../utils/utils";

/**
 * Overlay a party hat on an avatar image
 * @param image - The image URL or buffer to add the party hat to
 * @returns Buffer containing the processed image with party hat overlay
 * 
 * @example
 * ```ts
 * import { partyHat } from 'discord-image-utils';
 * 
 * const result = await partyHat('https://example.com/avatar.png');
 * // Returns a Buffer with the avatar + party hat
 * ```
 */
export const partyHat = async (image: ImageInput): Promise<Buffer> => {
	if (!image) {
		throw new Error("Image is required");
	}

	const isValid = await validateURL(image);
	if (!isValid) {
		throw new Error("Invalid URL provided");
	}

	// Load the party hat overlay and user's avatar
	const hat = await Jimp.read(getAssetPath("partyHat.png"));
	const avatar = await Jimp.read(image);

	// Create canvas for the composite image (400x400 is standard in this project)
	const compositeImage = new Jimp({
		width: 400,
		height: 400,
		color: 0xffffffff,
	});

	// Resize avatar to fill the canvas
	avatar.resize({ w: 400, h: 400 });

	// Resize party hat to fit nicely on top (approximately 40% of canvas width)
	const hatWidth = 160;
	const hatHeight = Math.round(
		hatWidth * (hat.height / hat.width)
	);
	hat.resize({ w: hatWidth, h: hatHeight });

	// Position hat at top-center of the avatar
	// Slightly overlapping the top edge for a natural look
	const hatX = Math.round((400 - hatWidth) / 2);
	const hatY = -10; // Slightly above the top edge

	// Composite: avatar first, then hat on top
	compositeImage.composite(avatar, 0, 0);
	compositeImage.composite(hat, hatX, hatY);

	return await compositeImage.getBuffer("image/png");
};
