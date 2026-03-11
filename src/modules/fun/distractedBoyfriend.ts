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
	positions?: Partial<{
		newGirl: { x: number; y: number; maxWidth?: number };
		boyfriend: { x: number; y: number; maxWidth?: number };
		girlfriend: { x: number; y: number; maxWidth?: number };
	}>;
}

const DEFAULT_OPTIONS = {
	fontSize: 28,
	textColor: "#FFFFFF",
	bold: true,
} satisfies Pick<DistractedBoyfriendOptions, "fontSize" | "textColor" | "bold">;

/**
 * Creates a Distracted Boyfriend meme
 * @param girlfriend - Text for the girlfriend on the right side of the meme
 * @param boyfriend - Text for the boyfriend in the middle of the meme
 * @param newGirl - Text for the new girl on the left side of the meme
 * @param options - Optional text styling and manual label positions
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

			// Anchor each label to the visible subject in the stock template.
			// These defaults can be overridden through `options.positions`
			// when a caller wants exact manual placement per role.
			// - newGirl: left foreground woman in red
			// - boyfriend: middle man turning back
			// - girlfriend: right woman reacting
			const rolePositions = {
				newGirl: {
					x: settings.positions?.newGirl?.x ?? 300,
					y: settings.positions?.newGirl?.y ?? 170,
					maxWidth: settings.positions?.newGirl?.maxWidth ?? 230,
				},
				boyfriend: {
					x: settings.positions?.boyfriend?.x ?? 665,
					y: settings.positions?.boyfriend?.y ?? 155,
					maxWidth: settings.positions?.boyfriend?.maxWidth ?? 230,
				},
				girlfriend: {
					x: settings.positions?.girlfriend?.x ?? 930,
					y: settings.positions?.girlfriend?.y ?? 175,
					maxWidth: settings.positions?.girlfriend?.maxWidth ?? 190,
				},
			};

			const positions = [
				{ text: newGirl, ...rolePositions.newGirl },
				{ text: boyfriend, ...rolePositions.boyfriend },
				{ text: girlfriend, ...rolePositions.girlfriend },
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
