/** @format */

import { Jimp } from "jimp";
import { validateURL } from "../../utils/utils";
import { ImageInput } from "../../types";

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
