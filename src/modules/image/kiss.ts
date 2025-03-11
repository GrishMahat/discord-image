/** @format */

import { Jimp } from "jimp";
import { join } from "path";
import { ImageInput } from "../../types";
import { validateURL } from "../../utils/utils";
/**
 * Creates a kiss meme from two images
 * @param image - The image URL or buffer to use for the kiss
 * @param image2 - The image URL or buffer to use for the kiss
 * @returns Promise<Buffer> - The generated kiss image
 */
export const kiss = async (
  image: ImageInput,
  image2: ImageInput
): Promise<Buffer> => {
  try {
    if (!image) {
      throw new Error("You must provide an image as a first argument.");
    }

    const isValid = await validateURL(image);
    if (!isValid) {
      throw new Error("You must provide a valid image URL or buffer.");
    }

    if (!image2) {
      throw new Error("You must provide an image as a second argument.");
    }
    const isValid2 = await validateURL(image2);
    if (!isValid2) {
      throw new Error("You must provide a valid image URL or buffer.");
    }

    // Use path.join for better path resolution
    const assetPath = join(__dirname, "../../assets/kiss.png");
    const base = await Jimp.read(assetPath);
    const avatar = await Jimp.read(image);
    const avatar2 = await Jimp.read(image2);

    // Apply circle masks
    avatar.circle();
    avatar2.circle();

    // Resize images with object parameters
    base.resize({ w: 768, h: 574 });
    avatar.resize({ w: 200, h: 200 });
    avatar2.resize({ w: 200, h: 200 });

    // Improve positioning - move avatars to better align with the kiss template
    base.composite(avatar, 180, 50);
    base.composite(avatar2, 380, 50);

    // Return the final image with higher quality
    return await base.getBuffer("image/png");
  } catch (error) {
    throw new Error(`Failed to generate kiss image: ${error}`);
  }
};
