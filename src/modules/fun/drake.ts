/** @format */
import { createCanvas, loadImage, registerFont } from "../../utils/canvas-compat";
import { join } from "path";
import { wrapText } from "../../utils/utils";

// Register fonts
try {
  registerFont(join(__dirname, "../../assets/fonts/Noto-Regular.ttf"), {
    family: "Noto",
  });
} catch (error) {
  console.warn("Font registration failed:", error);
}

interface DrakeOptions {
  fontSize?: number;
  textColor?: string;
  bold?: boolean;
}

const DEFAULT_OPTIONS: Required<DrakeOptions> = {
  fontSize: 32,
  textColor: "#000000",
  bold: false,
};

/**
 * Creates a Drake meme
 * @param text1 - Top panel text (rejected)
 * @param text2 - Bottom panel text (approved)
 * @param options - Optional text styling
 */
export async function drake(
  text1: string,
  text2: string,
  options: DrakeOptions = {}
): Promise<Buffer> {
  if (!text1?.trim() || !text2?.trim()) {
    throw new Error("Both text arguments are required");
  }

  const settings = { ...DEFAULT_OPTIONS, ...options };

  try {
    // Load template and setup canvas
    const base = await loadImage(join(__dirname, "../../assets/drake.jpeg"));
    const canvas = createCanvas(800, 800);
    const ctx = canvas.getContext("2d");

    // Draw template
    ctx.drawImage(base, 0, 0, 800, 800);

    // Configure text
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${settings.bold ? "bold" : ""} ${
      settings.fontSize
    }px Noto`.trim();
    ctx.fillStyle = settings.textColor;

    // Draw text
    const textX = 575;
    const maxWidth = 350;

    const [lines1, lines2] = await Promise.all([
      wrapText(ctx, text1, maxWidth),
      wrapText(ctx, text2, maxWidth),
    ]);

    if (!lines1 || !lines2) {
      throw new Error("Failed to wrap text");
    }

    // Draw top panel text
    lines1.forEach((line, i) => {
      ctx.fillText(line, textX, 200 + i * 40);
    });

    // Draw bottom panel text
    lines2.forEach((line, i) => {
      ctx.fillText(line, textX, 600 + i * 40);
    });

    return canvas.toBuffer("image/png");
  } catch (error) {
    throw new Error(`Failed to create meme: ${error}`);
  }
}

// Example usage:
/*
drake("Not using TypeScript", "Using TypeScript", {
  fontSize: 36,
  textColor: "#FFFFFF",
  bold: true,
  outline: true,
  outlineColor: "#000000",
  textAlign: "center",
});
*/
