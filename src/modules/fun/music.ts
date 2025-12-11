/** @format */

import type { MusicImageOptions } from "../../types/index";
import type { NodeCanvasRenderingContext2D } from "../../utils/canvas-compat";
import { createCanvas, loadImage } from "../../utils/canvas-compat";

/**
 * Generates random time values for the music player if not provided
 */
function randomTime(): { currentTime: number; totalTime: number } {
	const totalTime = Math.floor(Math.random() * 300) + 120; // Random duration between 2-7 minutes
	const currentTime = Math.floor(Math.random() * totalTime); // Random position within total time
	return { currentTime, totalTime };
}

/**
 * Validates that the time values are in an acceptable range.
 */
function validateTime(time: { currentTime: number; totalTime: number }): void {
	if (time.totalTime <= 0) {
		throw new Error("Invalid totalTime: must be greater than zero.");
	}
	if (time.currentTime < 0 || time.currentTime > time.totalTime) {
		throw new Error("Invalid currentTime: must be between 0 and totalTime.");
	}
}

/**
 * Validates the required properties of the MusicImageOptions.
 */
function validateInput(options: MusicImageOptions): void {
	if (!options.title) {
		throw new Error("Missing required option: title");
	}
	if (!options.artist) {
		throw new Error("Missing required option: artist");
	}
	if (!options.image) {
		throw new Error("Missing required option: image");
	}
	if (!options.time) {
		options.time = randomTime(); // Use random time if not provided
	}
	validateTime(options.time);
}

/**
 * Formats seconds as "m:ss" or "h:mm:ss" if over an hour
 */
function formatTime(seconds: number): string {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const secs = Math.floor(seconds % 60);

	if (hours > 0) {
		return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
	}
	return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Draws a rounded rectangle with optional gradient fill and glow effect
 */
function drawRoundedRect(
	ctx: NodeCanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number,
	radius: number,
	options?: {
		fill?: string | CanvasGradient;
		stroke?: string;
		strokeWidth?: number;
		glow?: {
			color: string;
			blur: number;
		};
	},
): void {
	ctx.save();
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

	if (options?.glow) {
		ctx.shadowColor = options.glow.color;
		ctx.shadowBlur = options.glow.blur;
	}

	if (options?.fill) {
		ctx.fillStyle = options.fill;
		ctx.fill();
	}

	if (options?.stroke) {
		ctx.strokeStyle = options.stroke;
		ctx.lineWidth = options.strokeWidth || 1;
		ctx.stroke();
	}

	ctx.restore();
}

/**
 * Draws a glowing circle with optional pulse animation
 */
function drawGlowingCircle(
	ctx: NodeCanvasRenderingContext2D,
	x: number,
	y: number,
	radius: number,
	color: string,
	pulse: boolean = false,
): void {
	ctx.save();

	if (pulse) {
		const now = Date.now();
		const scale = 1 + Math.sin(now / 200) * 0.1; // Subtle pulse effect
		radius *= scale;
	}

	// Draw outer glow
	ctx.beginPath();
	ctx.arc(x, y, radius * 1.5, 0, Math.PI * 2);
	ctx.fillStyle = `${color}33`; // 20% opacity
	ctx.fill();

	// Draw inner glow
	ctx.beginPath();
	ctx.arc(x, y, radius * 1.2, 0, Math.PI * 2);
	ctx.fillStyle = `${color}66`; // 40% opacity
	ctx.fill();

	// Draw main circle
	ctx.beginPath();
	ctx.arc(x, y, radius, 0, Math.PI * 2);
	ctx.shadowColor = color;
	ctx.shadowBlur = 15;
	ctx.fillStyle = color;
	ctx.fill();

	ctx.restore();
}

/**
 * Draws an animated wave visualizer effect
 */
function drawVisualizer(
	ctx: NodeCanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number,
	color: string,
): void {
	const bars = 30; // Increased number of bars
	const barWidth = width / (bars * 2);
	const maxBarHeight = height;
	const now = Date.now();

	ctx.save();
	ctx.fillStyle = color;
	ctx.globalAlpha = 0.7; // Increased opacity

	for (let i = 0; i < bars; i++) {
		// Create smooth animated height using sin waves
		const barHeight =
			(Math.sin(i * 0.2 + now / 200) * 0.5 + 0.5) * maxBarHeight;
		const barX = x + i * barWidth * 2;
		const barY = y + (height - barHeight) / 2;

		// Draw bar with gradient
		const gradient = ctx.createLinearGradient(
			barX,
			barY,
			barX,
			barY + barHeight,
		);
		gradient.addColorStop(0, color);
		gradient.addColorStop(1, `${color}66`);

		ctx.fillStyle = gradient;
		drawRoundedRect(ctx, barX, barY, barWidth, barHeight, barWidth / 2);
	}
	ctx.restore();
}

/**
 * Draws a modern play button with hover effect
 */
function drawPlayButton(
	ctx: NodeCanvasRenderingContext2D,
	x: number,
	y: number,
	size: number,
	isPlaying: boolean = false,
): void {
	ctx.save();

	// Draw outer glow
	ctx.beginPath();
	ctx.arc(x, y, size * 1.2, 0, Math.PI * 2);
	ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
	ctx.fill();

	// Draw main circle
	ctx.beginPath();
	ctx.arc(x, y, size, 0, Math.PI * 2);
	ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
	ctx.fill();

	// Draw border with enhanced glow
	ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
	ctx.lineWidth = 3;
	ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
	ctx.shadowBlur = 20;
	ctx.stroke();

	// Draw play/pause icon
	ctx.fillStyle = "#ffffff";
	if (isPlaying) {
		// Draw pause bars with rounded corners
		drawRoundedRect(ctx, x - size / 4, y - size / 3, size / 6, size / 1.5, 3, {
			fill: "#ffffff",
		});
		drawRoundedRect(ctx, x + size / 8, y - size / 3, size / 6, size / 1.5, 3, {
			fill: "#ffffff",
		});
	} else {
		// Draw play triangle with smooth edges
		ctx.beginPath();
		ctx.moveTo(x - size / 4, y - size / 3);
		ctx.lineTo(x + size / 3, y);
		ctx.lineTo(x - size / 4, y + size / 3);
		ctx.closePath();
		ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
		ctx.shadowBlur = 10;
		ctx.fill();
	}

	ctx.restore();
}

/**
 * Generates the music image with enhanced visuals and animations
 * @param options - The options for the music image
 * @returns The generated music image as a buffer
 */
export async function Music(options: MusicImageOptions): Promise<Buffer> {
	validateInput(options);

	const width = 1200;
	const height = 630;
	const canvas = createCanvas(width, height);
	const ctx = canvas.getContext("2d") as NodeCanvasRenderingContext2D;

	// Create dynamic gradient background
	const gradient = ctx.createRadialGradient(
		width / 2,
		height / 2,
		0,
		width / 2,
		height / 2,
		height,
	);
	gradient.addColorStop(0, "#4a3a6a");
	gradient.addColorStop(0.4, "#3a2a5a");
	gradient.addColorStop(0.7, "#2e1e3e");
	gradient.addColorStop(1, "#1a0f2a");
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, width, height);

	// Add subtle pattern overlay
	ctx.save();
	ctx.globalAlpha = 0.05;
	for (let i = 0; i < width; i += 20) {
		for (let j = 0; j < height; j += 20) {
			ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.1})`;
			ctx.fillRect(i, j, 1, 1);
		}
	}
	ctx.restore();

	try {
		// Load and draw album art with enhanced effects
		const albumImage = await loadImage(options.image);
		const imageSize = height * 0.7;
		const imageX = width * 0.1;
		const imageY = (height - imageSize) / 2;

		// Draw enhanced glow behind album art
		ctx.save();
		ctx.shadowColor = "rgba(255, 255, 255, 0.4)";
		ctx.shadowBlur = 80;
		ctx.drawImage(albumImage, imageX, imageY, imageSize, imageSize);
		ctx.restore();

		// Draw album art with enhanced frame
		ctx.save();
		ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
		ctx.shadowBlur = 40;
		ctx.shadowOffsetY = 25;

		// Draw enhanced frame with double border
		drawRoundedRect(
			ctx,
			imageX - 5,
			imageY - 5,
			imageSize + 10,
			imageSize + 10,
			10,
			{
				stroke: "rgba(255, 255, 255, 0.3)",
				strokeWidth: 3,
				glow: {
					color: "rgba(255, 255, 255, 0.2)",
					blur: 10,
				},
			},
		);

		// Draw album art with rounded corners
		ctx.save();
		ctx.beginPath();
		ctx.roundRect(imageX, imageY, imageSize, imageSize, 8);
		ctx.clip();
		ctx.drawImage(albumImage, imageX, imageY, imageSize, imageSize);
		ctx.restore();
		ctx.restore();

		// Draw text section
		const textX = imageX + imageSize + 60;
		const textWidth = width - textX - 40;

		// Draw title with enhanced typography
		ctx.save();
		ctx.font = "bold 52px 'Arial'";
		ctx.fillStyle = "#ffffff";
		ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
		ctx.shadowBlur = 25;
		const titleText = truncateText(options.title ?? "", ctx, textWidth);
		ctx.fillText(titleText, textX, height * 0.3);

		// Add underline accent
		const titleWidth = ctx.measureText(titleText).width;
		const accentGradient = ctx.createLinearGradient(
			textX,
			height * 0.3 + 10,
			textX + titleWidth,
			height * 0.3 + 10,
		);
		accentGradient.addColorStop(0, "#ae3ec9");
		accentGradient.addColorStop(1, "#3d5df0");

		drawRoundedRect(ctx, textX, height * 0.3 + 8, titleWidth, 4, 2, {
			fill: accentGradient,
			glow: {
				color: "rgba(174, 62, 201, 0.5)",
				blur: 10,
			},
		});
		ctx.restore();

		// Draw artist with enhanced style
		ctx.save();
		ctx.font = "36px 'Arial'";
		ctx.fillStyle = "#e0e0e0";
		ctx.shadowColor = "rgba(255, 255, 255, 0.4)";
		ctx.shadowBlur = 12;
		ctx.fillText(
			truncateText(options.artist ?? "", ctx, textWidth),
			textX,
			height * 0.3 + 60,
		);
		ctx.restore();

		// Draw enhanced animated visualizer
		drawVisualizer(
			ctx,
			textX,
			height * 0.45,
			textWidth,
			50,
			"rgba(174, 82, 221, 0.8)",
		);

		// Draw enhanced progress bar
		const progressBarY = height * 0.65;
		const progressBarWidth = textWidth;
		const progressBarHeight = 10;
		const progress = options.time
			? options.time.currentTime / options.time.totalTime
			: 0;

		// Enhanced background bar
		drawRoundedRect(
			ctx,
			textX,
			progressBarY,
			progressBarWidth,
			progressBarHeight,
			progressBarHeight / 2,
			{
				fill: "rgba(255, 255, 255, 0.15)",
				glow: {
					color: "rgba(255, 255, 255, 0.1)",
					blur: 5,
				},
			},
		);

		// Enhanced progress gradient
		const progressGradient = ctx.createLinearGradient(
			textX,
			0,
			textX + progressBarWidth,
			0,
		);
		progressGradient.addColorStop(0, "#ae3ec9");
		progressGradient.addColorStop(0.5, "#8a51e3");
		progressGradient.addColorStop(1, "#3d5df0");

		drawRoundedRect(
			ctx,
			textX,
			progressBarY,
			progressBarWidth * progress,
			progressBarHeight,
			progressBarHeight / 2,
			{
				fill: progressGradient,
				glow: {
					color: "rgba(174, 62, 201, 0.5)",
					blur: 15,
				},
			},
		);

		// Draw enhanced progress indicator
		const circleX = textX + progressBarWidth * progress;
		const circleY = progressBarY + progressBarHeight / 2;
		drawGlowingCircle(ctx, circleX, circleY, 12, "#ffffff", true);

		// Draw enhanced time stamps
		ctx.save();
		ctx.font = "bold 24px 'Arial'";
		ctx.fillStyle = "#e0e0e0";
		ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
		ctx.shadowBlur = 10;
		ctx.fillText(
			formatTime(options.time?.currentTime || 0),
			textX,
			progressBarY + 40,
		);
		ctx.textAlign = "right";
		ctx.fillText(
			formatTime(options.time?.totalTime || 0),
			textX + progressBarWidth,
			progressBarY + 40,
		);
		ctx.restore();

		// Draw enhanced player controls
		const controlsY = height * 0.8;
		const controlSpacing = 80;
		const controlsStartX = textX + progressBarWidth / 2 - controlSpacing * 2;

		// Previous track button
		drawControl(ctx, controlsStartX, controlsY, "⏮", false, true);

		// Play/Pause button (larger and more prominent)
		drawPlayButton(ctx, controlsStartX + controlSpacing, controlsY, 35, true);

		// Next track button
		drawControl(
			ctx,
			controlsStartX + controlSpacing * 2,
			controlsY,
			"⏭",
			false,
			true,
		);

		// Volume button with enhanced glow
		drawControl(
			ctx,
			controlsStartX + controlSpacing * 3,
			controlsY,
			"🔊",
			false,
			true,
		);

		// Shuffle button with enhanced glow
		drawControl(
			ctx,
			controlsStartX + controlSpacing * 4,
			controlsY,
			"🔀",
			false,
			true,
		);
	} catch (error) {
		console.error("Error generating music image:", error);
		throw error; // Re-throw to handle errors properly
	}

	return canvas.toBuffer("image/png");
}

/**
 * Truncates text to fit within a given width with smart ellipsis
 */
function truncateText(
	text: string,
	ctx: NodeCanvasRenderingContext2D,
	maxWidth: number,
): string {
	const ellipsis = "…";
	// const ellipsisWidth = ctx.measureText(ellipsis).width;

	if (ctx.measureText(text).width <= maxWidth) {
		return text;
	}

	let truncated = text;
	while (
		ctx.measureText(truncated + ellipsis).width > maxWidth &&
		truncated.length > 0
	) {
		truncated = truncated.slice(0, -1);
	}

	return truncated + ellipsis;
}

/**
 * Draws an enhanced control button with hover and active states
 */
function drawControl(
	ctx: NodeCanvasRenderingContext2D,
	x: number,
	y: number,
	symbol: string,
	isMain: boolean = false,
	withGlow: boolean = false,
): void {
	ctx.save();

	// Draw button background with enhanced glow
	if (isMain) {
		ctx.beginPath();
		ctx.arc(x, y, 30, 0, Math.PI * 2);
		ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
		ctx.fill();

		// Add pulsing glow effect
		ctx.shadowColor = "rgba(255, 255, 255, 0.4)";
		ctx.shadowBlur = 20 + Math.sin(Date.now() / 500) * 5;
	}

	// Draw symbol with enhanced style
	ctx.font = isMain ? "bold 48px 'Arial'" : "36px 'Arial'";
	ctx.fillStyle = isMain ? "#ffffff" : "#e0e0e0";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";

	if (withGlow) {
		ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
		ctx.shadowBlur = isMain ? 25 : 20;
	}

	ctx.fillText(symbol, x, y);

	ctx.restore();
}
