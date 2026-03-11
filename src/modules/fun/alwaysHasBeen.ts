/** @format */

import type { ImageInput } from "../../types";
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
import { validateURL, wrapText } from "../../utils/utils";

try {
	registerFont(getAssetPath("fonts/Noto-Regular.ttf"), {
		family: "Noto",
	});
} catch (_error) {
	// Fall back to generic fonts if registration fails.
}

export interface AlwaysHasBeenSlot {
	text?: string;
	image?: ImageInput;
}

export interface AlwaysHasBeenOptions {
	planet?: AlwaysHasBeenSlot;
	reveal?: AlwaysHasBeenSlot;
	fontSize?: number;
	textColor?: string;
	bold?: boolean;
}

const DEFAULT_OPTIONS: Required<
	Pick<AlwaysHasBeenOptions, "fontSize" | "textColor" | "bold">
> = {
	fontSize: 34,
	textColor: "#ffffff",
	bold: false,
};

function drawCircleImage(
	ctx: NodeCanvasRenderingContext2D,
	image: { width: number; height: number },
	centerX: number,
	centerY: number,
	radius: number,
) {
	ctx.save();
	ctx.beginPath();
	ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
	ctx.closePath();
	ctx.clip();

	const scale = Math.max(
		(radius * 2) / image.width,
		(radius * 2) / image.height,
	);
	const drawWidth = image.width * scale;
	const drawHeight = image.height * scale;
	const drawX = centerX - drawWidth / 2;
	const drawY = centerY - drawHeight / 2;

	ctx.drawImage(image as any, drawX, drawY, drawWidth, drawHeight);
	ctx.restore();
}

function drawRectImage(
	ctx: NodeCanvasRenderingContext2D,
	image: { width: number; height: number },
	x: number,
	y: number,
	width: number,
	height: number,
	radius: number,
) {
	ctx.save();
	roundedRect(ctx, x, y, width, height, radius);
	ctx.clip();

	const scale = Math.max(width / image.width, height / image.height);
	const drawWidth = image.width * scale;
	const drawHeight = image.height * scale;
	const drawX = x + (width - drawWidth) / 2;
	const drawY = y + (height - drawHeight) / 2;
	ctx.drawImage(image as any, drawX, drawY, drawWidth, drawHeight);

	ctx.restore();
}

function roundedRect(
	ctx: NodeCanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number,
	radius: number,
) {
	ctx.beginPath();
	ctx.moveTo(x + radius, y);
	ctx.lineTo(x + width - radius, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
	ctx.lineTo(x + width, y + height - radius);
	ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
	ctx.lineTo(x + radius, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
	ctx.lineTo(x, y + radius);
	ctx.quadraticCurveTo(x, y, x + radius, y);
	ctx.closePath();
}

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

function drawTextBlock(
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

	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.font = `${bold ? "700" : "400"} ${fontSize}px Noto`;
	ctx.fillStyle = textColor;
	ctx.strokeStyle = "rgba(0, 0, 0, 0.65)";
	ctx.lineWidth = 5;
	ctx.lineJoin = "round";

	const lineHeight = fontSize * 1.14;
	const totalHeight = lineHeight * lines.length;
	const startY = y - totalHeight / 2 + lineHeight / 2;

	lines.forEach((line, index) => {
		const lineY = startY + index * lineHeight;
		ctx.strokeText(line, x, lineY);
		ctx.fillText(line, x, lineY);
	});
}

async function resolveSlotImage(slot?: AlwaysHasBeenSlot) {
	if (!slot?.image) return null;
	const imageBuffer = await validateURL(slot.image);
	if (!imageBuffer) {
		throw new ValidationError("Failed to load slot image", "image");
	}
	return loadImage(imageBuffer);
}

export async function alwaysHasBeen(
	options: AlwaysHasBeenOptions,
): Promise<Buffer> {
	return ErrorHandler.withErrorHandling(async () => {
		if (!options?.planet && !options?.reveal) {
			throw new ValidationError(
				"You must provide planet or reveal content.",
				"options",
			);
		}

		if (
			!options.planet?.text?.trim() &&
			!options.planet?.image &&
			!options.reveal?.text?.trim() &&
			!options.reveal?.image
		) {
			throw new ValidationError(
				"At least one text or image slot must be provided.",
				"options",
			);
		}

		const settings = { ...DEFAULT_OPTIONS, ...options };

		try {
			const base = await loadImage(getAssetPath("always-has-been.png"));
			const [planetImage, revealImage] = await Promise.all([
				resolveSlotImage(options.planet),
				resolveSlotImage(options.reveal),
			]);

			const canvas = createCanvas(base.width, base.height);
			const ctx = canvas.getContext("2d");
			ctx.drawImage(base, 0, 0, base.width, base.height);

			if (planetImage) {
				drawCircleImage(ctx, planetImage, 242, 211, 145);
			}

			if (revealImage) {
				drawRectImage(ctx, revealImage, 698, 14, 190, 108, 18);
				ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
				ctx.lineWidth = 3;
				roundedRect(ctx, 698, 14, 190, 108, 18);
				ctx.stroke();
			}

			if (options.planet?.text?.trim()) {
				drawTextBlock(
					ctx,
					options.planet.text.trim(),
					366,
					190,
					340,
					settings.fontSize,
					18,
					3,
					settings.textColor,
					settings.bold,
				);
			}

			if (options.reveal?.text?.trim()) {
				drawTextBlock(
					ctx,
					options.reveal.text.trim(),
					790,
					46,
					250,
					settings.fontSize,
					18,
					3,
					settings.textColor,
					settings.bold,
				);
			}

			const buffer = canvas.toBuffer("image/png");
			if (!buffer || buffer.length === 0) {
				throw new ImageProcessingError(
					"Generated image buffer is empty",
					"alwaysHasBeen export",
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
					`Failed to create alwaysHasBeen meme: ${error.message}`,
					"alwaysHasBeen",
				);
			}
			throw error;
		}
	}, "alwaysHasBeen generator");
}
