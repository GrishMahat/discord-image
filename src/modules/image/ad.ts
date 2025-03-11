/** @format */

import { Jimp } from "jimp";
import { validateURL } from "../../utils/utils";
import { ImageInput } from "../../types";

/**
 * Add ad add meme to an image
 * @param image - The image to add the meme to
 * @returns The image with the meme added
 */
export const ad = async (image: ImageInput): Promise<Buffer> => {
  try {
    // Validate input
    if (!image) {
      throw new Error("Image is required");
    }

    const isValid = await validateURL(image);
    if (!isValid) {
      throw new Error("Invalid URL provided");
    }

    // Load and process images
    const userImage = await Jimp.read(image);
    const background = await Jimp.read(`${__dirname}/../../assets/ad.png`);

    // Resize user image
    userImage.resize({ w: 230, h: 230 });

    // Composite images
    background.composite(userImage, 150, 75);

    // Return processed image
    return background.getBuffer("image/png");

  } catch (error) {
    console.error("Error creating ad meme:", error);
    throw new Error(`Failed to create ad meme: ${error}`);
  }
};
