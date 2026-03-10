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
import { validateURL } from "../../utils/utils";

const WELCOME_FONT_FAMILY = "DiscordImageNoto";

try {
	registerFont(getAssetPath("fonts/Noto-Regular.ttf"), {
		family: WELCOME_FONT_FAMILY,
	});
} catch (_error) {
	// Fall back to generic fonts if registration fails.
}

export interface WelcomeCardMetaItem {
	label: string;
	value: string;
}

// Interface for welcome card options
export interface WelcomeCardOptions {
	username: string;
	avatar: ImageInput;
	servername?: string;
	memberCount?: number;
	background?: ImageInput;
	theme?: WelcomeTheme;
	message?: string;
	meta?: WelcomeCardMetaItem[];
	customization?: {
		textColor?: string;
		borderColor?: string;
		backgroundColor?: string;
		avatarBorderColor?: string;
		font?: string;
		fontSize?: number;
	};
}

// Theme definitions
export type WelcomeTheme =
	| "default"
	| "dark"
	| "light"
	| "colorful"
	| "minimal"
	| "tech";

// Theme configurations
const THEMES = {
	default: {
		backgroundColor: "rgba(23, 23, 23, 0.8)",
		textColor: "#FFFFFF",
		borderColor: "#3498db",
		avatarBorderColor: "#3498db",
		font: WELCOME_FONT_FAMILY,
		fontSize: 28,
	},
	dark: {
		backgroundColor: "rgba(10, 10, 10, 0.9)",
		textColor: "#E0E0E0",
		borderColor: "#7289DA",
		avatarBorderColor: "#7289DA",
		font: WELCOME_FONT_FAMILY,
		fontSize: 28,
	},
	light: {
		backgroundColor: "rgba(246, 249, 255, 0.92)",
		textColor: "#22314A",
		borderColor: "#5B7CFA",
		avatarBorderColor: "#7D9BFF",
		font: WELCOME_FONT_FAMILY,
		fontSize: 28,
	},
	colorful: {
		backgroundColor: "rgba(33, 50, 96, 0.84)",
		textColor: "#FFFFFF",
		borderColor: "#FF8A00",
		avatarBorderColor: "#FF4DB8",
		font: WELCOME_FONT_FAMILY,
		fontSize: 28,
	},
	minimal: {
		backgroundColor: "rgba(255, 255, 255, 0.95)",
		textColor: "#121826",
		borderColor: "#D4D9E3",
		avatarBorderColor: "#121826",
		font: WELCOME_FONT_FAMILY,
		fontSize: 28,
	},
	tech: {
		backgroundColor: "rgba(8, 16, 32, 0.85)",
		textColor: "#00FFFF",
		borderColor: "#00AAFF",
		avatarBorderColor: "#00FFFF",
		font: WELCOME_FONT_FAMILY,
		fontSize: 26,
	},
};

/**
 * Creates a welcome card for server greetings
 * @param options The options for the welcome card
 * @returns Promise<Buffer> - The generated welcome card image
 */
export const welcomeCard = async (
	options: WelcomeCardOptions,
): Promise<Buffer> => {
	return ErrorHandler.withErrorHandling(async () => {
		if (!options || !options.username || !options.avatar) {
			throw new ValidationError(
				"You must provide a username and avatar.",
				"options",
			);
		}

		const avatarBuffer = await validateURL(options.avatar);
		if (!avatarBuffer) {
			throw new ValidationError("Failed to load avatar image", "avatar");
		}

		const theme = options.theme || "default";
		const themeConfig = { ...THEMES[theme] };

		if (options.customization) {
			if (options.customization.backgroundColor)
				themeConfig.backgroundColor = options.customization.backgroundColor;
			if (options.customization.textColor)
				themeConfig.textColor = options.customization.textColor;
			if (options.customization.borderColor)
				themeConfig.borderColor = options.customization.borderColor;
			if (options.customization.avatarBorderColor)
				themeConfig.avatarBorderColor = options.customization.avatarBorderColor;
			if (options.customization.font)
				themeConfig.font = options.customization.font;
			if (options.customization.fontSize)
				themeConfig.fontSize = options.customization.fontSize;
		}

		let message = options.message || "Welcome to the server!";
		if (options.servername && !options.message) {
			message = `Welcome to ${options.servername}!`;
		}
		const metaItems = Array.isArray(options.meta)
			? options.meta
					.filter(
						(item): item is WelcomeCardMetaItem =>
							!!item &&
							typeof item.label === "string" &&
							typeof item.value === "string" &&
							item.label.trim().length > 0 &&
							item.value.trim().length > 0,
					)
					.slice(0, 3)
			: [];

		try {
			const canvas = createCanvas(800, 300);
			const ctx = canvas.getContext("2d");
			const width = canvas.width;
			const height = canvas.height;
			const accentColor = themeConfig.avatarBorderColor;
			const isLightTheme = theme === "light" || theme === "minimal";

			ctx.fillStyle = isLightTheme ? "#eef3fb" : "#05070c";
			ctx.fillRect(0, 0, width, height);

			if (options.background) {
				try {
					const backgroundBuffer = await validateURL(options.background);
					if (backgroundBuffer) {
						const backgroundImage = await loadImage(backgroundBuffer);
						drawCoverImage(ctx, backgroundImage, width, height);
						const imageOverlay = ctx.createLinearGradient(0, 0, width, height);
						imageOverlay.addColorStop(0, "rgba(5, 8, 18, 0.58)");
						imageOverlay.addColorStop(1, "rgba(5, 8, 18, 0.82)");
						ctx.fillStyle = imageOverlay;
						ctx.fillRect(0, 0, width, height);
					}
				} catch (_error) {
					// Keep default background on background image failures.
				}
			}

			drawAmbientGlow(ctx, 130, 80, 220, accentColor, 0.26);
			drawAmbientGlow(
				ctx,
				width - 120,
				height - 70,
				260,
				themeConfig.borderColor,
				0.18,
			);

			const shellX = 24;
			const shellY = 24;
			const shellWidth = width - shellX * 2;
			const shellHeight = height - shellY * 2;
			const shellRadius = 28;

			const shellGradient = ctx.createLinearGradient(
				shellX,
				shellY,
				width,
				height,
			);
			shellGradient.addColorStop(
				0,
				addAlpha(themeConfig.backgroundColor, isLightTheme ? 0.96 : 0.88),
			);
			shellGradient.addColorStop(
				1,
				theme === "colorful"
					? "rgba(32, 20, 58, 0.84)"
					: isLightTheme
						? theme === "minimal"
							? "rgba(248, 250, 252, 0.98)"
							: "rgba(229, 238, 255, 0.96)"
						: "rgba(10, 14, 24, 0.84)",
			);
			ctx.fillStyle = shellGradient;
			roundedRect(ctx, shellX, shellY, shellWidth, shellHeight, shellRadius);
			ctx.fill();

			ctx.strokeStyle = addAlpha(themeConfig.borderColor, 0.45);
			ctx.lineWidth = 1.5;
			roundedRect(ctx, shellX, shellY, shellWidth, shellHeight, shellRadius);
			ctx.stroke();
			drawThemeAccents(ctx, theme, width, height, themeConfig);

			const leftPanelX = 42;
			const leftPanelY = 42;
			const leftPanelWidth = 180;
			const leftPanelHeight = shellHeight - 36;
			const rightPanelX = 238;
			const rightPanelY = 42;
			const rightPanelWidth = width - rightPanelX - 42;
			const rightPanelHeight = shellHeight - 36;

			ctx.fillStyle = isLightTheme
				? theme === "minimal"
					? "rgba(255, 255, 255, 0.92)"
					: "rgba(255, 255, 255, 0.72)"
				: "rgba(255, 255, 255, 0.045)";
			roundedRect(
				ctx,
				leftPanelX,
				leftPanelY,
				leftPanelWidth,
				leftPanelHeight,
				22,
			);
			ctx.fill();
			roundedRect(
				ctx,
				rightPanelX,
				rightPanelY,
				rightPanelWidth,
				rightPanelHeight,
				22,
			);
			ctx.fill();

			const avatar = await loadImage(avatarBuffer);
			const avatarSize = 126;
			const avatarX = leftPanelX + leftPanelWidth / 2;
			const avatarY = 132;

			drawAmbientGlow(
				ctx,
				avatarX,
				avatarY,
				90,
				themeConfig.avatarBorderColor,
				0.35,
			);
			ctx.save();
			ctx.beginPath();
			ctx.arc(avatarX, avatarY, avatarSize / 2 + 10, 0, Math.PI * 2);
			ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
			ctx.fill();
			ctx.restore();

			ctx.save();
			ctx.beginPath();
			ctx.arc(avatarX, avatarY, avatarSize / 2, 0, Math.PI * 2);
			ctx.closePath();
			ctx.clip();
			ctx.drawImage(
				avatar,
				avatarX - avatarSize / 2,
				avatarY - avatarSize / 2,
				avatarSize,
				avatarSize,
			);
			ctx.restore();

			ctx.beginPath();
			ctx.arc(avatarX, avatarY, avatarSize / 2 + 6, 0, Math.PI * 2);
			ctx.strokeStyle = addAlpha(themeConfig.avatarBorderColor, 0.95);
			ctx.lineWidth = 4;
			ctx.stroke();

			ctx.beginPath();
			ctx.arc(avatarX, avatarY, avatarSize / 2 + 13, 0, Math.PI * 2);
			ctx.strokeStyle = addAlpha(themeConfig.avatarBorderColor, 0.22);
			ctx.lineWidth = 1.5;
			ctx.stroke();

			ctx.textAlign = "center";
			ctx.fillStyle = themeConfig.textColor;
			ctx.font = `700 14px ${themeConfig.font}`;
			ctx.fillText("NEW MEMBER", avatarX, 232);
			ctx.font = `600 18px ${themeConfig.font}`;
			ctx.fillStyle = addAlpha(themeConfig.textColor, 0.82);
			ctx.fillText(`@${truncateText(options.username, 14)}`, avatarX, 252);

			const headerY = 84;
			drawPill(
				ctx,
				rightPanelX + 20,
				headerY - 26,
				134,
				30,
				addAlpha(themeConfig.borderColor, 0.18),
				addAlpha(themeConfig.borderColor, 0.35),
			);
			ctx.textAlign = "center";
			ctx.font = `700 14px ${themeConfig.font}`;
			ctx.fillStyle = addAlpha(themeConfig.textColor, 0.88);
			ctx.fillText("WELCOME ABOARD", rightPanelX + 87, headerY - 7);

			ctx.textAlign = "left";
			ctx.fillStyle = themeConfig.textColor;
			const fittedTitle = fitTextWithSize(
				ctx,
				options.username,
				rightPanelWidth - 42,
				themeConfig.fontSize + 10,
				themeConfig.font,
				24,
				true,
			);
			ctx.font = `700 ${fittedTitle.size}px ${themeConfig.font}`;
			ctx.fillText(fittedTitle.text, rightPanelX + 20, headerY + 36);

			const hasMeta = metaItems.length > 0;
			const contentBottomY = hasMeta ? 214 : 224;

			ctx.font = `${themeConfig.fontSize - 2}px ${themeConfig.font}`;
			ctx.fillStyle = addAlpha(themeConfig.textColor, 0.88);
			const messageLines = wrapText(
				ctx,
				message,
				rightPanelWidth - 48,
				hasMeta ? 2 : 3,
			);
			messageLines.forEach((line, index) => {
				ctx.fillText(line, rightPanelX + 20, 160 + index * 28);
			});

			if (options.servername && !hasMeta) {
				ctx.font = `600 18px ${themeConfig.font}`;
				ctx.fillStyle = addAlpha(themeConfig.textColor, 0.72);
				ctx.fillText(
					`Server: ${fitText(ctx, options.servername, rightPanelWidth - 48, 18, themeConfig.font, 14)}`,
					rightPanelX + 20,
					contentBottomY + 18,
				);
			}

			if (hasMeta) {
				const footerY = rightPanelY + rightPanelHeight - 70;
				const gap = 14;
				const availableWidth = rightPanelWidth - 40;
				const totalGap = gap * (metaItems.length - 1);
				const badgeWidth = Math.floor(
					(availableWidth - totalGap) / metaItems.length,
				);

				metaItems.forEach((item, index) => {
					drawInfoBadge(
						ctx,
						rightPanelX + 20 + index * (badgeWidth + gap),
						footerY,
						badgeWidth,
						50,
						item.label,
						item.value,
						themeConfig,
					);
				});
			}

			if (theme === "tech") {
				drawTechElements(
					ctx,
					canvas.width,
					canvas.height,
					themeConfig.borderColor,
				);
			}

			const buffer = canvas.toBuffer("image/png");
			if (!buffer || buffer.length === 0) {
				throw new ImageProcessingError(
					"Generated image buffer is empty",
					"welcomeCard export",
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
					`Failed to create welcome card: ${error.message}`,
					"welcomeCard",
				);
			}
			throw error;
		}
	}, "welcomeCard generator");
};

/**
 * Draws tech-themed decorative elements for the tech theme
 */
function drawTechElements(
	ctx: NodeCanvasRenderingContext2D,
	width: number,
	height: number,
	color: string,
) {
	// Draw corner brackets
	const bracketSize = 30;
	const offset = 25;

	// Top-left bracket
	ctx.beginPath();
	ctx.moveTo(offset, offset + bracketSize);
	ctx.lineTo(offset, offset);
	ctx.lineTo(offset + bracketSize, offset);
	ctx.strokeStyle = color;
	ctx.lineWidth = 2;
	ctx.stroke();

	// Top-right bracket
	ctx.beginPath();
	ctx.moveTo(width - offset, offset + bracketSize);
	ctx.lineTo(width - offset, offset);
	ctx.lineTo(width - offset - bracketSize, offset);
	ctx.stroke();

	// Bottom-left bracket
	ctx.beginPath();
	ctx.moveTo(offset, height - offset - bracketSize);
	ctx.lineTo(offset, height - offset);
	ctx.lineTo(offset + bracketSize, height - offset);
	ctx.stroke();

	// Bottom-right bracket
	ctx.beginPath();
	ctx.moveTo(width - offset, height - offset - bracketSize);
	ctx.lineTo(width - offset, height - offset);
	ctx.lineTo(width - offset - bracketSize, height - offset);
	ctx.stroke();

	// Draw scan lines
	ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
	for (let i = 0; i < height; i += 4) {
		ctx.fillRect(offset, offset + i, width - offset * 2, 1);
	}
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

function addAlpha(color: string, alpha: number): string {
	if (color.startsWith("rgba(")) {
		return color.replace(
			/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/,
			`rgba($1, $2, $3, ${alpha})`,
		);
	}

	if (color.startsWith("rgb(")) {
		return color.replace(
			/rgb\((\d+),\s*(\d+),\s*(\d+)\)/,
			`rgba($1, $2, $3, ${alpha})`,
		);
	}

	if (color.startsWith("#")) {
		const hex = color.slice(1);
		const normalized =
			hex.length === 3
				? hex
						.split("")
						.map((char) => char + char)
						.join("")
				: hex;
		const r = Number.parseInt(normalized.slice(0, 2), 16);
		const g = Number.parseInt(normalized.slice(2, 4), 16);
		const b = Number.parseInt(normalized.slice(4, 6), 16);
		return `rgba(${r}, ${g}, ${b}, ${alpha})`;
	}

	return color;
}

function drawAmbientGlow(
	ctx: NodeCanvasRenderingContext2D,
	x: number,
	y: number,
	radius: number,
	color: string,
	alpha: number,
) {
	const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
	gradient.addColorStop(0, addAlpha(color, alpha));
	gradient.addColorStop(1, addAlpha(color, 0));
	ctx.fillStyle = gradient;
	ctx.beginPath();
	ctx.arc(x, y, radius, 0, Math.PI * 2);
	ctx.fill();
}

function drawCoverImage(
	ctx: NodeCanvasRenderingContext2D,
	image: { width: number; height: number },
	width: number,
	height: number,
) {
	const scale = Math.max(width / image.width, height / image.height);
	const drawWidth = image.width * scale;
	const drawHeight = image.height * scale;
	const drawX = (width - drawWidth) / 2;
	const drawY = (height - drawHeight) / 2;
	ctx.drawImage(image as any, drawX, drawY, drawWidth, drawHeight);
}

function truncateText(text: string, maxLength: number): string {
	return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}

function fitText(
	ctx: NodeCanvasRenderingContext2D,
	text: string,
	maxWidth: number,
	startSize: number,
	font: string,
	minSize: number,
	bold = false,
): string {
	let size = startSize;
	while (size >= minSize) {
		ctx.font = `${bold ? "700" : "400"} ${size}px ${font}`;
		if (ctx.measureText(text).width <= maxWidth) return text;
		size -= 1;
	}
	return truncateText(text, Math.max(8, Math.floor(maxWidth / 14)));
}

function wrapText(
	ctx: NodeCanvasRenderingContext2D,
	text: string,
	maxWidth: number,
	maxLines: number,
): string[] {
	const words = text.split(/\s+/).filter(Boolean);
	if (words.length === 0) return [text];

	const lines: string[] = [];
	let current = "";

	for (const word of words) {
		const candidate = current ? `${current} ${word}` : word;
		if (ctx.measureText(candidate).width <= maxWidth) {
			current = candidate;
			continue;
		}

		if (current) {
			lines.push(current);
			if (lines.length === maxLines - 1) {
				current = word;
				break;
			}
		}

		current = word;
	}

	if (current) {
		lines.push(current);
	}

	return lines.slice(0, maxLines).map((line, index, array) => {
		if (index !== array.length - 1) return line;
		if (ctx.measureText(line).width <= maxWidth) return line;
		let trimmed = line;
		while (
			trimmed.length > 1 &&
			ctx.measureText(`${trimmed}…`).width > maxWidth
		) {
			trimmed = trimmed.slice(0, -1);
		}
		return `${trimmed}…`;
	});
}

function drawPill(
	ctx: NodeCanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number,
	fill: string,
	stroke: string,
) {
	roundedRect(ctx, x, y, width, height, height / 2);
	ctx.fillStyle = fill;
	ctx.fill();
	ctx.strokeStyle = stroke;
	ctx.lineWidth = 1;
	ctx.stroke();
}

function drawInfoBadge(
	ctx: NodeCanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number,
	label: string,
	value: string,
	themeConfig: {
		textColor: string;
		borderColor: string;
		backgroundColor: string;
		font: string;
	},
) {
	roundedRect(ctx, x, y, width, height, 16);
	ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
	ctx.fill();
	ctx.strokeStyle = addAlpha(themeConfig.borderColor, 0.25);
	ctx.lineWidth = 1;
	ctx.stroke();

	ctx.fillStyle = addAlpha(themeConfig.textColor, 0.6);
	ctx.font = `700 11px ${themeConfig.font}`;
	ctx.fillText(label, x + 14, y + 15);

	ctx.fillStyle = themeConfig.textColor;
	const { text: fittedValue, size } = fitTextWithSize(
		ctx,
		value,
		width - 28,
		18,
		themeConfig.font,
		11,
		true,
	);
	ctx.font = `700 ${size}px ${themeConfig.font}`;
	ctx.fillText(fittedValue, x + 14, y + 35);
}

// Dead code kept intentionally for future welcome-card layout experiments.
// It may be reused later or removed once the layout direction settles.
function _drawMetaLine(
	ctx: NodeCanvasRenderingContext2D,
	x: number,
	y: number,
	maxWidth: number,
	items: Array<{ label: string; value: string }>,
	themeConfig: {
		textColor: string;
		borderColor: string;
		backgroundColor: string;
		font: string;
	},
) {
	let cursorX = x;
	const gap = 26;

	for (const item of items) {
		ctx.font = `600 15px ${themeConfig.font}`;
		const labelText = `${item.label}: `;
		const labelWidth = ctx.measureText(labelText).width;
		const remainingWidth = maxWidth - (cursorX - x);
		if (remainingWidth <= 60) break;

		ctx.fillStyle = addAlpha(themeConfig.textColor, 0.56);
		ctx.fillText(labelText, cursorX, y);
		cursorX += labelWidth;

		const valueBudget = Math.max(40, remainingWidth - labelWidth - gap);
		const { text: fittedValue, size } = fitTextWithSize(
			ctx,
			item.value,
			Math.min(valueBudget, item.label === "Theme" ? 80 : valueBudget),
			15,
			themeConfig.font,
			12,
			true,
		);
		ctx.font = `700 ${size}px ${themeConfig.font}`;
		ctx.fillStyle = themeConfig.textColor;
		ctx.fillText(fittedValue, cursorX, y);
		cursorX += ctx.measureText(fittedValue).width + gap;
	}
}

function fitTextWithSize(
	ctx: NodeCanvasRenderingContext2D,
	text: string,
	maxWidth: number,
	startSize: number,
	font: string,
	minSize: number,
	bold = false,
): { text: string; size: number } {
	let size = startSize;
	while (size >= minSize) {
		ctx.font = `${bold ? "700" : "400"} ${size}px ${font}`;
		if (ctx.measureText(text).width <= maxWidth) {
			return { text, size };
		}
		size -= 1;
	}

	const fallbackSize = minSize;
	ctx.font = `${bold ? "700" : "400"} ${fallbackSize}px ${font}`;
	let trimmed = text;
	while (
		trimmed.length > 1 &&
		ctx.measureText(`${trimmed}…`).width > maxWidth
	) {
		trimmed = trimmed.slice(0, -1);
	}
	return { text: `${trimmed}…`, size: fallbackSize };
}

function drawThemeAccents(
	ctx: NodeCanvasRenderingContext2D,
	theme: WelcomeTheme,
	width: number,
	height: number,
	themeConfig: {
		textColor: string;
		borderColor: string;
		backgroundColor: string;
		avatarBorderColor: string;
		font: string;
		fontSize: number;
	},
) {
	switch (theme) {
		case "default": {
			const gradient = ctx.createLinearGradient(0, 0, width, 0);
			gradient.addColorStop(0, addAlpha(themeConfig.borderColor, 0));
			gradient.addColorStop(0.5, addAlpha(themeConfig.borderColor, 0.18));
			gradient.addColorStop(1, addAlpha(themeConfig.borderColor, 0));
			ctx.fillStyle = gradient;
			ctx.fillRect(40, 30, width - 80, 3);
			break;
		}
		case "dark": {
			ctx.strokeStyle = addAlpha(themeConfig.borderColor, 0.16);
			for (let i = 0; i < 5; i += 1) {
				ctx.beginPath();
				ctx.arc(width - 110, 70, 28 + i * 14, 0.25, 1.15);
				ctx.stroke();
			}
			break;
		}
		case "light": {
			const gradient = ctx.createLinearGradient(0, 0, width, 0);
			gradient.addColorStop(0, addAlpha("#9db6ff", 0.18));
			gradient.addColorStop(0.5, addAlpha("#ffffff", 0.04));
			gradient.addColorStop(1, addAlpha("#5B7CFA", 0.16));
			ctx.fillStyle = gradient;
			ctx.fillRect(24, 24, width - 48, 34);

			ctx.fillStyle = addAlpha(themeConfig.borderColor, 0.12);
			for (let i = 0; i < 9; i += 1) {
				ctx.beginPath();
				ctx.arc(70 + i * 82, 46, 2.5, 0, Math.PI * 2);
				ctx.fill();
			}
			break;
		}
		case "colorful": {
			const gradient = ctx.createLinearGradient(0, 0, width, height);
			gradient.addColorStop(0, addAlpha("#ff8a00", 0.24));
			gradient.addColorStop(0.35, addAlpha("#00d1ff", 0.12));
			gradient.addColorStop(0.7, addAlpha("#7c3aed", 0.12));
			gradient.addColorStop(1, addAlpha("#ff4db8", 0.22));
			ctx.fillStyle = gradient;
			ctx.beginPath();
			ctx.moveTo(width - 260, 24);
			ctx.lineTo(width - 24, 24);
			ctx.lineTo(width - 24, 170);
			ctx.closePath();
			ctx.fill();

			ctx.strokeStyle = addAlpha("#ffffff", 0.18);
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.moveTo(280, 40);
			ctx.bezierCurveTo(420, 90, 520, 10, 720, 80);
			ctx.stroke();
			break;
		}
		case "minimal": {
			ctx.strokeStyle = addAlpha("#121826", 0.12);
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(250, 116);
			ctx.lineTo(width - 60, 116);
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(250, 224);
			ctx.lineTo(width - 60, 224);
			ctx.stroke();
			break;
		}
		case "tech": {
			ctx.strokeStyle = addAlpha(themeConfig.borderColor, 0.18);
			ctx.lineWidth = 1;
			for (let y = 44; y < height - 44; y += 8) {
				ctx.beginPath();
				ctx.moveTo(240, y);
				ctx.lineTo(width - 50, y);
				ctx.stroke();
			}
			break;
		}
	}
}

/**
 * Class-based API for the welcome card
 */
export class WelcomeCardBuilder {
	private username: string = "";
	private avatar: ImageInput = "";
	private servername?: string;
	private memberCount?: number;
	private background?: ImageInput;
	private theme: WelcomeTheme = "default";
	private message?: string;
	private meta?: WelcomeCardMetaItem[];
	private customization: {
		textColor?: string;
		borderColor?: string;
		backgroundColor?: string;
		avatarBorderColor?: string;
		font?: string;
		fontSize?: number;
	} = {};

	/**
	 * Create a new WelcomeCardBuilder instance
	 * @param options Optional initial configuration
	 */
	constructor(options?: Partial<WelcomeCardOptions>) {
		if (options) {
			if (options.username) this.username = options.username;
			if (options.avatar) this.avatar = options.avatar;
			if (options.servername) this.servername = options.servername;
			if (options.memberCount) this.memberCount = options.memberCount;
			if (options.background) this.background = options.background;
			if (options.theme) this.theme = options.theme;
			if (options.message) this.message = options.message;
			if (options.meta) this.meta = options.meta;
			if (options.customization) this.customization = options.customization;
		}
	}

	/**
	 * Set the username
	 */
	setUsername(username: string): WelcomeCardBuilder {
		this.username = username;
		return this;
	}

	/**
	 * Set the avatar
	 */
	setAvatar(avatar: ImageInput): WelcomeCardBuilder {
		this.avatar = avatar;
		return this;
	}

	/**
	 * Set the server name
	 */
	setServerName(servername: string): WelcomeCardBuilder {
		this.servername = servername;
		return this;
	}

	/**
	 * Set the member count
	 */
	setMemberCount(count: number): WelcomeCardBuilder {
		this.memberCount = count;
		return this;
	}

	/**
	 * Set the background image
	 */
	setBackground(background: ImageInput): WelcomeCardBuilder {
		this.background = background;
		return this;
	}

	/**
	 * Set the theme
	 */
	setTheme(theme: WelcomeTheme): WelcomeCardBuilder {
		this.theme = theme;
		return this;
	}

	/**
	 * Set the welcome message
	 */
	setMessage(message: string): WelcomeCardBuilder {
		this.message = message;
		return this;
	}

	/**
	 * Set custom metadata items shown in the footer area
	 */
	setMeta(items: WelcomeCardMetaItem[]): WelcomeCardBuilder {
		this.meta = items;
		return this;
	}

	/**
	 * Add a single metadata item shown in the footer area
	 */
	addMeta(label: string, value: string): WelcomeCardBuilder {
		if (!this.meta) this.meta = [];
		this.meta.push({ label, value });
		return this;
	}

	/**
	 * Set the text color
	 */
	setTextColor(color: string): WelcomeCardBuilder {
		this.customization.textColor = color;
		return this;
	}

	/**
	 * Set the border color
	 */
	setBorderColor(color: string): WelcomeCardBuilder {
		this.customization.borderColor = color;
		return this;
	}

	/**
	 * Set the background color
	 */
	setBackgroundColor(color: string): WelcomeCardBuilder {
		this.customization.backgroundColor = color;
		return this;
	}

	/**
	 * Set the avatar border color
	 */
	setAvatarBorderColor(color: string): WelcomeCardBuilder {
		this.customization.avatarBorderColor = color;
		return this;
	}

	/**
	 * Set the font
	 */
	setFont(font: string): WelcomeCardBuilder {
		this.customization.font = font;
		return this;
	}

	/**
	 * Set the font size
	 */
	setFontSize(size: number): WelcomeCardBuilder {
		this.customization.fontSize = size;
		return this;
	}

	/**
	 * Render the welcome card
	 */
	async render(): Promise<Buffer> {
		if (!this.username || !this.avatar) {
			throw new Error("Username and avatar are required");
		}

		return welcomeCard({
			username: this.username,
			avatar: this.avatar,
			servername: this.servername,
			memberCount: this.memberCount,
			background: this.background,
			theme: this.theme,
			message: this.message,
			meta: this.meta,
			customization: this.customization,
		});
	}
}
