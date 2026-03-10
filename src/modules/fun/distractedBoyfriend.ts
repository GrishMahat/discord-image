/** @format */

import {
	createCanvas,
	loadImage,
	registerFont,
} from "../../utils/canvas-compat";
import {
	ErrorHandler,
	ImageProcessingError,
	ValidationError,
} from "../../utils/errors";
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

interface DistractedBoyfriendOptions {
	fontSize?: number;
	textColor?: string;
	bold?: boolean;
}

const DEFAULT_OPTIONS: Required<DistractedBoyfriendOptions> = {
	fontSize: 28,
	textColor: "#FFFFFF",
	bold: true,
};

/**
 * Creates a Distracted Boyfriend meme
 * @param girlfriend - Text for the girlfriend (left)
 * @param boyfriend - Text for the boyfriend (center)
 * @param newGirl - Text for the other girl (right)
 * @param options - Optional text styling
 * @returns Promise<Buffer> - The generated meme image
 */
export async function distractedBoyfriend(
	girlfriend: string,
	boyfriend: string,
	newGirl: string,
	options: DistractedBoyfriendOptions = {},
): Promise<Buffer> {
	return ErrorHandler.withErrorHandling(async () => {
		if (!girlfriend?.trim() || !boyfriend?.trim() || !newGirl?.trim()) {
			throw new ValidationError(
				"All three text arguments are required",
				"text",
			);
		}

		const settings = { ...DEFAULT_OPTIONS, ...options };

		try {
			const base = await loadImage(getAssetPath("distracted-boyfriend.jpg"));
			const canvas = createCanvas(base.width, base.height);
			const ctx = canvas.getContext("2d");

			ctx.drawImage(base, 0, 0, base.width, base.height);
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.font =
				`${settings.bold ? "bold" : ""} ${settings.fontSize}px Noto`.trim();
			ctx.fillStyle = settings.textColor;
			ctx.strokeStyle = "#000000";
			ctx.lineWidth = 3;

			const positions = [
				{ text: girlfriend, x: 700, y: 215, maxWidth: 220 },
				{ text: boyfriend, x: 440, y: 300, maxWidth: 200 },
				{ text: newGirl, x: 210, y: 175, maxWidth: 200 },
			];

			for (const position of positions) {
				const lines = wrapText(ctx, position.text, position.maxWidth);
				if (!lines) continue;

				const lineHeight = settings.fontSize * 1.2;
				const totalHeight = lines.length * lineHeight;
				const startY = position.y - totalHeight / 2;

				lines.forEach((line, i) => {
					const y = startY + i * lineHeight;
					ctx.strokeText(line, position.x, y);
					ctx.fillText(line, position.x, y);
				});
			}

			const buffer = canvas.toBuffer("image/png");
			if (!buffer || buffer.length === 0) {
				throw new ImageProcessingError(
					"Generated image buffer is empty",
					"distractedBoyfriend export",
				);
			}
			return buffer;
		} catch (error) {
			if (
				error instanceof ValidationError ||
				error instanceof ImageProcessingError
			) {
				throw error;
			}
			if (error instanceof Error) {
				throw new ImageProcessingError(
					`Failed to create distractedBoyfriend meme: ${error.message}`,
					"distractedBoyfriend",
				);
			}
			throw error;
		}
	}, "distractedBoyfriend generator");
}
