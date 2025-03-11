import { createCanvas, loadImage, Image, CanvasRenderingContext2D as NodeCanvasRenderingContext2D } from "canvas";
import { validateURL } from "../../utils/utils";
import { ImageInput } from "../../types";

/**
 * Creates a clown meme from an image
 * @param image - The image URL or buffer to use
 * @returns Promise<Buffer> - The generated clown meme image
 */
export const clown = async (image: ImageInput): Promise<Buffer> => {
  if (!image) {
    throw new Error("You must provide an image as an argument");
  }

  const isValid = await validateURL(image);
  if (!isValid) {
    throw new Error("You must provide a valid image URL or buffer.");
  }

  try {
    // Helper function to draw rotated images
    function drawImage(
      ctx: NodeCanvasRenderingContext2D,
      image: Image,
      x: number,
      y: number,
      w: number,
      h: number,
      degrees: number
    ) {
      ctx.save();
      ctx.translate(x + w / 2, y + h / 2);
      ctx.rotate((degrees * Math.PI) / 180.0);
      ctx.translate(-x - w / 2, -y - h / 2);
      ctx.drawImage(image, x, y, w, h);
      ctx.restore();
    }

    const canvas = createCanvas(610, 343);
    const ctx = canvas.getContext("2d");

    // Load images
    const [userImage, background] = await Promise.all([
      loadImage(image),
      loadImage(`${__dirname}/../../assets/clown.png`)
    ]);

    // Draw the base canvas
    ctx.fillRect(0, 0, 610, 343);

    // Draw the rotated user image
    drawImage(ctx, userImage, 15, 55, 145, 130, -5);

    // Overlay the clown template
    ctx.drawImage(background, 0, 0, 610, 343);

    return canvas.toBuffer();
  } catch (error) {
    throw new Error(`Failed to process image: ${error}`);
  }
};
