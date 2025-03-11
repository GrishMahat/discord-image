/** @format */

import { Jimp } from "jimp";
import { validateURL } from "../../utils/utils";
import { ImageInput } from "../../types";

/**
 * Applies a blur effect to an image
 * @param image - The image URL or buffer to apply the blur effect to
 * @param level - The level of blur to apply (1-10)
 * @returns Promise<Buffer> - The generated blurred image
 */
export const blur = async (
  image: ImageInput,
  level: number = 10
): Promise<Buffer> => {
  if (!image) {
    throw new Error("You must provide an image as the first argument.");
  }

  const isValid = await validateURL(image);
  if (!isValid) {
    throw new Error("You must provide a valid image URL or buffer.");
  }

  if (level < 1 || level > 10) {
    throw new Error("Level must be between 1 and 10.");
  }

  try {
    const jimpImage = await Jimp.read(image);
    jimpImage.blur(level);

    const buffer = await jimpImage.getBuffer("image/png");
    return buffer;
  } catch (error) {
    throw new Error(`Failed to process image: ${error}`);
  }
};
