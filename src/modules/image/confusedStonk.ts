import type { ImageInput } from "../../types";
import { createCanvas, loadImage } from "../../utils/canvas-compat";
import { getAssetPath } from "../../utils/paths";
import { validateURL } from "../../utils/utils";

let confusedStonkBackgroundPromise: Promise<any> | null = null;

async function getConfusedStonkBackground(): Promise<any> {
	if (!confusedStonkBackgroundPromise) {
		confusedStonkBackgroundPromise = loadImage(
			getAssetPath("confusedStonk.png"),
		);
	}
	return confusedStonkBackgroundPromise;
}

export const confusedStonk = async (image: ImageInput): Promise<Buffer> => {
	try {
		if (!image) {
			throw new Error("Image is required");
		}

		const imageBuffer = await validateURL(image);
		if (!imageBuffer) {
			throw new Error("Invalid URL provided");
		}

		const [avatar, baseBackground] = await Promise.all([
			loadImage(imageBuffer),
			getConfusedStonkBackground(),
		]);

		const canvas = createCanvas(baseBackground.width, baseBackground.height);
		const ctx = canvas.getContext("2d");

		ctx.fillStyle = "#ffffff";
		ctx.fillRect(0, 0, baseBackground.width, baseBackground.height);
		ctx.drawImage(avatar, 190, 70, 400, 400);
		ctx.drawImage(baseBackground, 0, 0);

		return canvas.toBuffer("image/png");
	} catch (error) {
		console.error("Error creating confused stonk effect:", error);
		throw new Error(`Failed to create confused stonk effect: ${error}`);
	}
};
