/** @format */

import type { NodeCanvasRenderingContext2D } from "../../utils/canvas-compat";
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

try {
	registerFont(getAssetPath("fonts/Noto-Regular.ttf"), {
		family: "Noto",
	});
} catch (_error) {
	// Fall back to generic fonts if registration fails.
}

interface TwoButtonsOptions {
	fontSize?: number;
	textColor?: string;
	bold?: boolean;
}

const DEFAULT_OPTIONS: Required<TwoButtonsOptions> = {
	fontSize: 28,
	textColor: "#111111",
	bold: true,
};

function fitLines(
	ctx: NodeCanvasRenderingContext2D,
	text: string,
	maxWidth: number,
	startSize: number,
	minSize: number,
	maxLines: number,
	bold: boolean,
): { lines: string[]; fontSize: number } {
	let fontSize = startSize;

	while (fontSize >= minSize) {
		ctx.font = `${bold ? "700" : "400"} ${fontSize}px Noto`;
		const lines = wrapText(ctx, text, maxWidth);
		if (lines && lines.length <= maxLines) {
			return { lines, fontSize };
		}
		fontSize -= 1;
	}

	ctx.font = `${bold ? "700" : "400"} ${minSize}px Noto`;
	return {
		lines: wrapText(ctx, text, maxWidth)?.slice(0, maxLines) ?? [text],
		fontSize: minSize,
	};
}

function drawLabel(
	ctx: NodeCanvasRenderingContext2D,
	text: string,
	x: number,
	y: number,
	maxWidth: number,
	startSize: number,
	minSize: number,
	maxLines: number,
	textColor: string,
	bold: boolean,
	rotationDegrees: number = 0,
) {
	const { lines, fontSize } = fitLines(
		ctx,
		text,
		maxWidth,
		startSize,
		minSize,
		maxLines,
		bold,
	);

	const lineHeight = fontSize * 1.14;
	const totalHeight = lineHeight * lines.length;
	const startY = y - totalHeight / 2 + lineHeight / 2;

	ctx.font = `${bold ? "700" : "400"} ${fontSize}px Noto`;
	ctx.fillStyle = textColor;
	ctx.strokeStyle = "#ffffff";
	ctx.lineWidth = 4;
	ctx.lineJoin = "round";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";

	ctx.save();
	ctx.translate(x, y);
	ctx.rotate((rotationDegrees * Math.PI) / 180);

	lines.forEach((line, index) => {
		const lineY = startY + index * lineHeight - y;
		ctx.strokeText(line, 0, lineY);
		ctx.fillText(line, 0, lineY);
	});

	ctx.restore();
}

export async function twoButtons(
	button1: string,
	button2: string,
	bottomText: string,
	options: TwoButtonsOptions = {},
): Promise<Buffer> {
	return ErrorHandler.withErrorHandling(async () => {
		if (!button1?.trim() || !button2?.trim() || !bottomText?.trim()) {
			throw new ValidationError(
				"button1, button2, and bottomText are required",
				"text",
			);
		}

		const settings = { ...DEFAULT_OPTIONS, ...options };

		try {
			const base = await loadImage(getAssetPath("two-buttons.jpg"));
			const canvas = createCanvas(base.width, base.height);
			const ctx = canvas.getContext("2d");

			ctx.drawImage(base, 0, 0, base.width, base.height);

			// Template anchors:
			// - button1: left top button panel
			// - button2: right top button panel
			// - bottomText: lower sweating character panel
			drawLabel(
				ctx,
				button1.trim(),
				155,
				110,
				180,
				settings.fontSize,
				18,
				3,
				settings.textColor,
				settings.bold,
				-8,
			);
			drawLabel(
				ctx,
				button2.trim(),
				362,
				116,
				180,
				settings.fontSize,
				18,
				3,
				settings.textColor,
				settings.bold,
				-11,
			);
			drawLabel(
				ctx,
				bottomText.trim(),
				300,
				786,
				430,
				settings.fontSize + 8,
				22,
				4,
				settings.textColor,
				settings.bold,
			);

			const buffer = canvas.toBuffer("image/png");
			if (!buffer || buffer.length === 0) {
				throw new ImageProcessingError(
					"Generated image buffer is empty",
					"twoButtons export",
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
					`Failed to create twoButtons meme: ${error.message}`,
					"twoButtons",
				);
			}
			throw error;
		}
	}, "twoButtons generator");
}
