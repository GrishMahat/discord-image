/** @format */

import { createCanvas, loadImage } from "../../utils/canvas-compat";
import { ImageInput } from "../../types";
import { validateURL } from "../../utils/utils";
import GIFEncoder from "gifencoder";

/**
 * Creates a blinking GIF animation from multiple images
 * @param delay - Time between frames in milliseconds
 * @param optionsOrFirstImage - Either options object or the first image (for backward compatibility)
 * @param images - Array of image URLs or buffers
 * @returns Buffer containing the generated GIF
 */
export const blink = async (
  delay: number,
  optionsOrFirstImage?:
    | {
        width?: number;
        height?: number;
        quality?: number;
        repeat?: number;
        transparent?: number | string;
        fitMethod?: "cover" | "contain" | "stretch";
      }
    | ImageInput,
  ...images: ImageInput[]
): Promise<Buffer> => {
  let options: {
    width?: number;
    height?: number;
    quality?: number;
    repeat?: number;
    transparent?: number | string;
    fitMethod?: "cover" | "contain" | "stretch";
  } = {};

  // Handle backward compatibility - if optionsOrFirstImage is an image input, rearrange parameters
  if (optionsOrFirstImage !== undefined) {
    if (
      typeof optionsOrFirstImage === "string" ||
      optionsOrFirstImage instanceof Buffer
    ) {
      // It's an image, not options
      images = [optionsOrFirstImage as ImageInput, ...images];
    } else {
      // It's options
      options = optionsOrFirstImage as {
        width?: number;
        height?: number;
        quality?: number;
        repeat?: number;
        transparent?: number | string;
        fitMethod?: "cover" | "contain" | "stretch";
      };
    }
  }

  // Validate inputs
  if (!images || images.length < 2) {
    throw new Error("You must provide at least two images.");
  }
  if (isNaN(delay) || delay < 0) {
    throw new Error("Delay must be a non-negative number.");
  }

  // Set default options
  const width = options?.width || 480;
  const height = options?.height || 480;
  const quality = options?.quality || 10; // 1-20, lower is better
  const repeat = options?.repeat ?? 0; // 0 = loop forever
  const transparent = options?.transparent ?? 0; // transparent color (black)
  const fitMethod = options?.fitMethod || "cover";

  // Validate all images before processing
  for (const image of images) {
    const isValid = await validateURL(image);
    if (!isValid) {
      throw new Error("You must provide a valid image URL or buffer.");
    }
  }

  // Initialize GIF encoder
  const GIF = new GIFEncoder(width, height);
  GIF.start();
  GIF.setRepeat(repeat);
  GIF.setDelay(delay);
  GIF.setQuality(quality);
  GIF.setTransparent(transparent);

  // Create canvas for drawing images
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Process each image
  for (const image of images) {
    try {
      const base = await loadImage(image);

      // Clear the canvas
      ctx.fillStyle = "rgba(0, 0, 0, 0)";
      ctx.clearRect(0, 0, width, height);

      // Calculate dimensions based on fit method
      const sx = 0;
      const sy = 0;
      const sWidth = base.width;
      const sHeight = base.height;
      let dx = 0,
        dy = 0,
        dWidth = width,
        dHeight = height;

      if (fitMethod === "cover") {
        // Cover - fill entire area, crop if needed
        const scale = Math.max(width / base.width, height / base.height);
        const scaledWidth = base.width * scale;
        const scaledHeight = base.height * scale;
        dx = (width - scaledWidth) / 2;
        dy = (height - scaledHeight) / 2;
        dWidth = scaledWidth;
        dHeight = scaledHeight;
      } else if (fitMethod === "contain") {
        // Contain - fit entire image, add padding if needed
        const scale = Math.min(width / base.width, height / base.height);
        const scaledWidth = base.width * scale;
        const scaledHeight = base.height * scale;
        dx = (width - scaledWidth) / 2;
        dy = (height - scaledHeight) / 2;
        dWidth = scaledWidth;
        dHeight = scaledHeight;
      }
      // 'stretch' is the default and uses the full dimensions

      // Draw the image
      ctx.drawImage(base, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);

      // Add the frame
      GIF.addFrame(ctx as unknown as CanvasRenderingContext2D);
    } catch (error) {
      console.error(`Error processing image: ${error}`);
      throw new Error(`Failed to process image: ${error}`);
    }
  }

  // Finalize the GIF
  GIF.finish();
  return GIF.out.getData();
};
