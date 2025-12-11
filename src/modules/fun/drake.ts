/** @format */

import {
	createCanvas,
	loadImage,
	registerFont,
} from "../../utils/canvas-compat";
import { getAssetPath } from "../../utils/paths";
import { wrapText } from "../../utils/utils";

// Register fonts
try {
	registerFont(getAssetPath("fonts/Noto-Regular.ttf"), {
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
	fontSize: 40,
	textColor: "#000000",
	bold: true,
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
	options: DrakeOptions = {},
): Promise<Buffer> {
	if (!text1?.trim() || !text2?.trim()) {
		throw new Error("Both text arguments are required");
	}

	const settings = { ...DEFAULT_OPTIONS, ...options };

	try {
		// Load template and setup canvas
		const base = await loadImage(getAssetPath("drake.jpeg"));
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

		// Draw top panel text with stroke for visibility
		ctx.strokeStyle = "#FFFFFF";
		ctx.lineWidth = 3;
		ctx.lineJoin = "round";
		lines1.forEach((line, i) => {
			ctx.strokeText(line, textX, 200 + i * 45);
			ctx.fillText(line, textX, 200 + i * 45);
		});

		// Draw bottom panel text with stroke
		lines2.forEach((line, i) => {
			ctx.strokeText(line, textX, 600 + i * 45);
			ctx.fillText(line, textX, 600 + i * 45);
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
