/** @format */

import { createCanvas, loadImage } from "canvas";
import { join } from "path";
import { ImageInput } from "../../types";
import { validateURL, applyText } from "../../utils/utils";

/**
 * Creates a "Wanted" poster meme from an image
 * 
 * @param image - The image URL or buffer to use for the wanted poster
 * @param currency - Currency symbol for the bounty (defaults to $)
 * @param amount - Bounty amount (random if not specified)
 * @returns Promise<Buffer> - The generated wanted poster image
 */
export const wanted = async (
  image: ImageInput,
  currency: string = "$", 
  amount?: number
): Promise<Buffer> => {
  try {
    // Validate inputs
    if (!image) {
      throw new Error("An image input is required");
    }

    // Generate random bounty amount if none provided
    if (!amount) {
      amount = Math.floor(Math.random() * 200000) + 300000;
    }

    // Validate image URL
    const isValid = await validateURL(image);
    if (!isValid) {
      throw new Error("Invalid image URL or buffer provided");
    }

    // Set up canvas
    const canvas = createCanvas(257, 383);
    const ctx = canvas.getContext("2d");

    // Load images
    const [avatar, wantedTemplate] = await Promise.all([
      loadImage(image),
      loadImage(join(__dirname, "../../assets/wanted.png")),
    ]);

    // Draw the suspect's image
    ctx.drawImage(avatar, 25, 60, 210, 210);

    // Overlay the wanted poster template
    ctx.drawImage(wantedTemplate, 0, 0, 257, 383);

    // Add the bounty text
    const bountyText = `${currency}${amount}`;
    ctx.textAlign = "center";
    ctx.fillStyle = "#513d34";
    
    // Get appropriate font size
    ctx.font = await applyText(
      canvas as unknown as {
        getContext: (
          contextId: string,
          options?: unknown
        ) => CanvasRenderingContext2D;
      },
      bountyText,
      80,
      200,
      "Times New Roman"
    );

    // Draw bounty amount
    ctx.fillText(bountyText, 128, 315);

    return canvas.toBuffer();

  } catch (error) {
    throw new Error(`Failed to generate wanted poster: ${error}`);
  }
};
