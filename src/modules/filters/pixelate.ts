/** @format */
import { Jimp } from "jimp";
import { validateURL } from "../../utils/utils";
import { ImageInput } from "../../types";

/**
 * Applies a pixelation effect to an image
 * @param image - The image URL or buffer to pixelate
 * @param pixelSize - Size of pixels (1-50, default: 5)
 * @returns Promise<Buffer> - The pixelated image
 */
export async function pixelate(
  image: ImageInput,
  pixelSize: number = 5
): Promise<Buffer> {
  if (!image) {
    throw new Error("Image is required");
  }

  const isValid = await validateURL(image);
  if (!isValid) {
    throw new Error("Invalid URL provided");
  }

  if (pixelSize < 1 || pixelSize > 50) {
    throw new Error("Pixel size must be between 1 and 50");
  }

  try {
    const img = await Jimp.read(image);
    img.pixelate(pixelSize);
    return await img.getBuffer("image/png");
  } catch (error) {
    throw new Error(`Failed to pixelate image: ${error}`);
  }
}
