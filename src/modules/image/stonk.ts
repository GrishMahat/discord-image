import { createCanvas, loadImage } from "canvas";
import { ImageInput } from "../../types";
import { validateURL } from "../../utils/utils";

/**
 * Add a stonk meme to an image
 * @param image - The image URL or buffer to add the stonk meme to
 * @returns Buffer containing the processed image
 */
export const stonk = async (image: ImageInput): Promise<Buffer> => {
  try {
    if (!image) {
      throw new Error("Image is required");
    }

    const isValid = await validateURL(image);
    if (!isValid) {
      throw new Error("Invalid URL provided");
    }

    const canvas = createCanvas(900, 539);
    const ctx = canvas.getContext("2d");

    // Load and draw the user image
    const userImage = await loadImage(image);
    ctx.drawImage(userImage, 70, 40, 240, 240);

    // Load and draw the stonk background
    const background = await loadImage(`${__dirname}/../../assets/stonk.png`);
    ctx.drawImage(background, 0, 0, 900, 539);

    return canvas.toBuffer();

  } catch (error) {
    console.error("Error creating stonk meme:", error);
    throw new Error(`Failed to create stonk meme: ${error}`);
  }
}