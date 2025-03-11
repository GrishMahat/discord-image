/** @format */

import { createCanvas, loadImage } from "canvas";
import { ImageInput } from "../../types";
import { validateURL } from "../../utils/utils";
import GIFEncoder from "gifencoder";

/**
 * Creates a "triggered" GIF effect on an image
 * @param image - Image URL or buffer to apply effect to
 * @param timeout - Delay between frames in milliseconds (default: 15)
 * @returns Buffer containing the generated GIF
 */
export const triggered = async (image: ImageInput, timeout: number = 15): Promise<Buffer> => {
  // Validate inputs
  if (!image) {
    throw new Error("Image is required");
  }

  const isValid = await validateURL(image);
  if (!isValid) {
    throw new Error("Invalid image");
  }
  if (isNaN(timeout)) {
    throw new Error("Timeout must be a number");
  }

  // Load images
  const base = await loadImage(`${__dirname}/../../assets/triggered.png`);
  const img = await loadImage(image);

  // Initialize GIF encoder
  const GIF = new GIFEncoder(256, 310);
  GIF.start();
  GIF.setRepeat(0); // Loop forever
  GIF.setDelay(timeout);

  // Create canvas
  const canvas = createCanvas(256, 310);
  const ctx = canvas.getContext("2d");

  // Constants for random offsets
  const BACKGROUND_RANGE = 20; // Range for background image shake
  const LABEL_RANGE = 10; // Range for "triggered" label shake

  // Generate frames
  for (let i = 0; i < 9; i++) {
    // Clear previous frame
    ctx.clearRect(0, 0, 256, 310);

    // Draw shaking background image
    ctx.drawImage(
      img,
      Math.floor(Math.random() * BACKGROUND_RANGE) - BACKGROUND_RANGE,
      Math.floor(Math.random() * BACKGROUND_RANGE) - BACKGROUND_RANGE,
      256 + BACKGROUND_RANGE,
      310 - 54 + BACKGROUND_RANGE
    );

    // Add red overlay
    ctx.fillStyle = "#FF000033";
    ctx.fillRect(0, 0, 256, 310);

    // Draw shaking "triggered" label
    ctx.drawImage(
      base,
      Math.floor(Math.random() * LABEL_RANGE) - LABEL_RANGE,
      310 - 54 + Math.floor(Math.random() * LABEL_RANGE) - LABEL_RANGE,
      256 + LABEL_RANGE,
      54 + LABEL_RANGE
    );

    GIF.addFrame(ctx as unknown as CanvasRenderingContext2D);
  }

  // Finalize and return GIF
  GIF.finish();
  return GIF.out.getData();
};