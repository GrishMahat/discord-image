import { Jimp } from "jimp";
import type { ImageInput } from "../../types";
import {
	ErrorHandler,
	ImageProcessingError,
	ValidationError,
} from "../../utils/errors";
import { getAssetPath } from "../../utils/paths";
import { validateURL } from "../../utils/utils";

export const Delete = async (image: ImageInput): Promise<Buffer> => {
	return ErrorHandler.withErrorHandling(async () => {
		ErrorHandler.validateRequired(image, "image");

		const imageBuffer = await validateURL(image);
		if (!imageBuffer) {
			throw new ValidationError("Failed to load image", "image", image);
		}

		try {
			const background = await Jimp.read(getAssetPath("delete.png"));
			const imageToProcess = await Jimp.read(imageBuffer);

			imageToProcess.resize({ w: 195, h: 195 });
			background.composite(imageToProcess, 120, 135);

			const buffer = await background.getBuffer("image/png");
			if (!buffer || buffer.length === 0) {
				throw new ImageProcessingError(
					"Generated image buffer is empty",
					"delete export",
				);
			}

			return buffer;
		} catch (error) {
			if (error instanceof ImageProcessingError) {
				throw error;
			}
			if (error instanceof Error) {
				throw new ImageProcessingError(
					`Failed to process delete image: ${error.message}`,
					"delete",
				);
			}
			throw error;
		}
	}, "delete image generator");
};
