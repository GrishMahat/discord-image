import { createCanvas, loadImage, registerFont } from "../../utils/canvas-compat";
import type { NodeCanvasRenderingContext2D } from "../../utils/canvas-compat";
import path from "path";
import { wrapText } from "../../utils/utils";

// Register fonts
registerFont(`${__dirname}/../../assets/fonts/Noto-Regular.ttf`, {
  family: `Noto`,
});
registerFont(`${__dirname}/../../assets/fonts/Noto-Emoji.ttf`, {
  family: `Noto`,
});


/**
 * Create a presentation image with Lisa from The Simpsons
 * @param text The text to display in the presentation
 * @returns A buffer containing the presentation image
 */

export const lisaPresentation = async (text: string): Promise<Buffer> => {
  // Input validation
  if (!text || text.length === 0 || text.length > 250) { 
    throw new Error("Text must be between 1 and 250 characters");
  }

  // Load and setup canvas
  const base = await loadImage(path.join(`${__dirname}/../../assets/lisa-presentation.png`));
  const canvas = createCanvas(base.width, base.height);
  const ctx = canvas.getContext("2d") as NodeCanvasRenderingContext2D;

  // Draw background image
  ctx.drawImage(base, 0, 0);

  // Configure text settings
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  
  // Calculate optimal font size
  let fontSize = 40;
  ctx.font = `${fontSize}px Noto`;
  while (ctx.measureText(text).width > 1320 && fontSize > 12) {
    fontSize -= 1;
    ctx.font = `${fontSize}px Noto`;
  }

  // Wrap and position text
  const lines = await wrapText(ctx, text, 330);
  if (!lines) {
    throw new Error("Failed to wrap text");
  }

  const lineSpacing = 20;
  const topMost = 185 - (((fontSize * lines.length) / 2) + ((lineSpacing * (lines.length - 1)) / 2));

  // Draw text lines
  lines.forEach((line, i) => {
    const height = topMost + ((fontSize + lineSpacing) * i);
    ctx.fillText(line, base.width / 2, height);
  });

  return canvas.toBuffer();
}