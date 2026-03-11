/** @format */

import { applyPalette, GIFEncoder, quantize } from "gifenc";
import type { ImageInput } from "../../types";
import { createCanvas, loadImage } from "../../utils/canvas-compat";
import {
	ErrorHandler,
	ImageProcessingError,
	ValidationError,
} from "../../utils/errors";
import { renderPNG } from "../../utils/paths";
import { validateURL } from "../../utils/utils";

function formatTimestamp(date: Date): string {
	const yyyy = date.getFullYear();
	const mm = String(date.getMonth() + 1).padStart(2, "0");
	const dd = String(date.getDate()).padStart(2, "0");
	const hh = String(date.getHours()).padStart(2, "0");
	const min = String(date.getMinutes()).padStart(2, "0");
	const ss = String(date.getSeconds()).padStart(2, "0");
	return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

function clampLabel(label: string, max = 22): string {
	const trimmed = label.trim();
	if (trimmed.length <= max) return trimmed;
	return `${trimmed.slice(0, max - 3)}...`;
}

function isGifInput(image: ImageInput, imageBuffer: Buffer): boolean {
	if (
		imageBuffer.length >= 6 &&
		(imageBuffer.subarray(0, 6).toString("ascii") === "GIF87a" ||
			imageBuffer.subarray(0, 6).toString("ascii") === "GIF89a")
	) {
		return true;
	}

	if (typeof image !== "string") return false;
	const normalized = image.trim().toLowerCase();
	return (
		normalized.startsWith("data:image/gif") ||
		normalized.endsWith(".gif") ||
		normalized.includes(".gif?")
	);
}

function drawSecurityCameraFrame(
	ctx: CanvasRenderingContext2D,
	source: { width: number; height: number },
	frameIndex: number,
	label: string,
	timestamp: string,
): void {
	const width = 800;
	const height = 600;

	ctx.fillStyle = "#08110a";
	ctx.fillRect(0, 0, width, height);

	const sourceRatio = source.width / source.height;
	const targetRatio = width / height;
	let drawWidth = width;
	let drawHeight = height;
	let drawX = 0;
	let drawY = 0;

	if (sourceRatio > targetRatio) {
		drawHeight = height;
		drawWidth = height * sourceRatio;
		drawX = (width - drawWidth) / 2;
	} else {
		drawWidth = width;
		drawHeight = width / sourceRatio;
		drawY = (height - drawHeight) / 2;
	}

	const jitterX = (frameIndex % 3) - 1;
	const jitterY = ((frameIndex * 2) % 3) - 1;
	ctx.filter = "grayscale(1) contrast(1.15) saturate(0.45) brightness(0.82)";
	ctx.drawImage(
		source as CanvasImageSource,
		drawX + jitterX,
		drawY + jitterY,
		drawWidth,
		drawHeight,
	);
	ctx.filter = "none";

	ctx.fillStyle = "rgba(18, 60, 24, 0.18)";
	ctx.fillRect(0, 0, width, height);

	for (let y = 0; y < height; y += 4) {
		ctx.fillStyle =
			(y + frameIndex) % 8 === 0
				? "rgba(255,255,255,0.05)"
				: "rgba(0,0,0,0.10)";
		ctx.fillRect(0, y, width, 2);
	}

	for (let i = 0; i < 1400; i++) {
		const x = Math.floor(Math.random() * width);
		const y = Math.floor(Math.random() * height);
		const alpha = Math.random() * 0.12;
		ctx.fillStyle =
			Math.random() > 0.5
				? `rgba(255,255,255,${alpha})`
				: `rgba(0,0,0,${alpha + 0.03})`;
		ctx.fillRect(x, y, 1, 1);
	}

	const vignette = ctx.createRadialGradient(
		width / 2,
		height / 2,
		180,
		width / 2,
		height / 2,
		520,
	);
	vignette.addColorStop(0, "rgba(0,0,0,0)");
	vignette.addColorStop(1, "rgba(0,0,0,0.72)");
	ctx.fillStyle = vignette;
	ctx.fillRect(0, 0, width, height);

	ctx.strokeStyle = "rgba(196, 255, 196, 0.28)";
	ctx.lineWidth = 3;
	ctx.strokeRect(12, 12, width - 24, height - 24);

	if (frameIndex % 2 === 0) {
		ctx.fillStyle = "#ff3b30";
		ctx.beginPath();
		ctx.arc(40, 40, 8, 0, Math.PI * 2);
		ctx.fill();
	}

	ctx.font = "bold 26px monospace";
	ctx.fillStyle = "#f3fff2";
	ctx.fillText("REC", 58, 48);

	ctx.font = "bold 28px monospace";
	ctx.fillStyle = "#d8ffe0";
	ctx.textAlign = "left";
	ctx.fillText(clampLabel(label), 22, height - 26);

	ctx.textAlign = "right";
	ctx.font = "24px monospace";
	ctx.fillText(timestamp, width - 22, height - 26);

	ctx.textAlign = "left";
	ctx.font = "20px monospace";
	ctx.fillStyle = "rgba(216,255,224,0.85)";
	ctx.fillText("LIVE FEED", 22, 82);
}

function renderStaticSecurityCamera(
	source: { width: number; height: number },
	label: string,
	timestamp: string,
): Buffer {
	const canvas = createCanvas(800, 600);
	const ctx = canvas.getContext("2d");
	drawSecurityCameraFrame(ctx, source, 0, label, timestamp);
	return renderPNG(canvas);
}

function renderAnimatedSecurityCamera(
	source: { width: number; height: number },
	label: string,
	timestamp: string,
): Buffer {
	const width = 800;
	const height = 600;
	const frameCount = 8;
	const delay = 9;
	const GIF = GIFEncoder();
	const canvas = createCanvas(width, height);
	const ctx = canvas.getContext("2d");

	for (let i = 0; i < frameCount; i++) {
		ctx.clearRect(0, 0, width, height);
		drawSecurityCameraFrame(ctx, source, i, label, timestamp);

		const imageData = ctx.getImageData(0, 0, width, height).data;
		const palette = quantize(imageData, 128) as Array<[number, number, number]>;
		const frame = applyPalette(imageData, palette);

		GIF.writeFrame(frame, width, height, {
			palette,
			delay,
			repeat: i === 0 ? 0 : undefined,
		});
	}

	GIF.finish();
	return Buffer.from(GIF.bytes());
}

export const securityCamera = async (
	image: ImageInput,
	label: string = "CAM 03",
): Promise<Buffer> => {
	return ErrorHandler.withErrorHandling(async () => {
		ErrorHandler.validateRequired(image, "image");
		ErrorHandler.validateStringLength(label, 40, "label", 1);

		const imageBuffer = await validateURL(image);
		if (!imageBuffer) {
			throw new ValidationError("Failed to load image", "image", image);
		}

		try {
			const source = await loadImage(imageBuffer);
			const timestamp = formatTimestamp(new Date());
			const buffer = isGifInput(image, imageBuffer)
				? renderAnimatedSecurityCamera(source, label, timestamp)
				: renderStaticSecurityCamera(source, label, timestamp);
			if (!buffer || buffer.length === 0) {
				throw new ImageProcessingError(
					"Generated image buffer is empty",
					"securityCamera export",
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
					`Failed to create security camera image: ${error.message}`,
					"securityCamera",
				);
			}

			throw error;
		}
	}, "security camera generator");
};
