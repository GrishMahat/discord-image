/** @format */

import { createCanvas, loadImage } from "../../utils/canvas-compat";
import { join } from "path";
import { ImageInput } from "../../types";
import { validateURL } from "../../utils/utils";

/**
 * Applies the "Affect My Baby" meme template to an image
 *
 * @param image - The image URL or buffer to process
 * @param options - Optional configuration settings
 * @param options.resize - Whether to resize the image
 * @param options.enhance - Whether to enhance the image integration
 * @param options.opacity - Opacity of the user image (0-1)
 * @returns A Promise that resolves with a Buffer containing the processed image
 */
export const affect = async (
  image: ImageInput,
  options?: {
    resize?: boolean; // Whether to resize the image
    enhance?: boolean; // Whether to enhance the image integration
    opacity?: number; // Opacity of the user image (0-1)
  }
): Promise<Buffer> => {
  // Default options
  const shouldResize = options?.resize !== false; // Default to true
  const shouldEnhance = options?.enhance !== false; // Default to true
  const opacity = options?.opacity !== undefined ? options?.opacity : 1.0;

  // Validate input
  if (!image) {
    throw new Error("You must provide an image as the first argument.");
  }

  try {
    const isValid = await validateURL(image);
    if (!isValid) {
      throw new Error("You must provide a valid image URL or buffer.");
    }

    // Construct path to the template image
    const templatePath = join(__dirname, "../../assets/affect.png");

    // Load both images concurrently
    const [template, userImage] = await Promise.all([
      loadImage(templatePath),
      loadImage(image),
    ]);

    // Create a canvas with the template dimensions
    const canvas = createCanvas(template.width, template.height);
    const ctx = canvas.getContext("2d");

    // Draw the template first
    ctx.drawImage(template, 0, 0);

    // Set up compositing for better integration
    if (shouldEnhance) {
      ctx.globalAlpha = opacity;

      // Apply a slight color adjustment (simulated)
      if (opacity < 1) {
        ctx.globalCompositeOperation = "source-over";
      }
    }

    // Calculate positioning - the baby monitor area is around position 180,383
    const frameWidth = 160;
    const frameHeight = 170;
    let drawWidth = frameWidth;
    let drawHeight = frameHeight;

    // Handle resizing if needed
    if (shouldResize) {
      // Use the specified frame dimensions
      drawWidth = frameWidth;
      drawHeight = frameHeight;
    } else {
      // Maintain aspect ratio but fit within frame
      const aspectRatio = userImage.width / userImage.height;
      if (aspectRatio > frameWidth / frameHeight) {
        // Image is wider than the frame
        drawWidth = frameWidth;
        drawHeight = frameWidth / aspectRatio;
      } else {
        // Image is taller than the frame
        drawHeight = frameHeight;
        drawWidth = frameHeight * aspectRatio;
      }
    }

    // Center the image in the frame area
    const x = 180 + (frameWidth - drawWidth) / 2;
    const y = 383 + (frameHeight - drawHeight) / 2;

    // Draw the user image in the frame
    ctx.drawImage(userImage, x, y, drawWidth, drawHeight);

    // Reset composite operation and alpha
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1.0;

    // Return the processed image as buffer
    return canvas.toBuffer("image/png");
  } catch (error) {
    console.error("Error creating affect meme:", error);
    throw new Error(`Failed to create affect meme: ${error}`);
  }
};
