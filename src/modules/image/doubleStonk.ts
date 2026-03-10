import { Jimp } from "jimp";
import type { ImageInput } from "../../types";
import {
	ErrorHandler,
	ImageProcessingError,
	ValidationError,
} from "../../utils/errors";
import { getAssetPath } from "../../utils/paths";
import { validateURL } from "../../utils/utils";

export const doubleStonk = async (
	image: ImageInput,
	image2: ImageInput,
): Promise<Buffer> => {
	return ErrorHandler.withErrorHandling(async () => {
		ErrorHandler.validateRequired(image, "image");
		ErrorHandler.validateRequired(image2, "image2");

		const [imageBuffer1, imageBuffer2] = await Promise.all([
			validateURL(image),
			validateURL(image2),
		]);

		if (!imageBuffer1) {
			throw new ValidationError("Failed to load image", "image", image);
		}
		if (!imageBuffer2) {
			throw new ValidationError("Failed to load image", "image2", image2);
		}

		try {
			const base = await Jimp.read(getAssetPath("doubleStonk.png"));
			base.resize({ w: 577, h: 431 });

			const avatar1 = await Jimp.read(imageBuffer1);
			avatar1.resize({ w: 140, h: 140 });
			avatar1.circle();

			const avatar2 = await Jimp.read(imageBuffer2);
			avatar2.resize({ w: 140, h: 140 });
			avatar2.circle();

			base.composite(avatar2, 60, 20);
			base.composite(avatar1, 0, 30);

			const buffer = await base.getBuffer("image/png");
			if (!buffer || buffer.length === 0) {
				throw new ImageProcessingError(
					"Generated image buffer is empty",
					"doubleStonk export",
				);
			}

			return buffer;
		} catch (error) {
			if (error instanceof ImageProcessingError) {
				throw error;
			}
			if (error instanceof Error) {
				throw new ImageProcessingError(
					`Failed to create double stonk effect: ${error.message}`,
					"doubleStonk",
				);
			}
			throw error;
		}
	}, "doubleStonk image generator");
};
