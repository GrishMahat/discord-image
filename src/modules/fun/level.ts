import type { ImageInput } from "../../types";
import { createCanvas, loadImage } from "../../utils/canvas-compat";
import { validateURL } from "../../utils/utils";

// Interface for Discord User object
interface DiscordUser {
	id: string;
	avatar: string;
}

// Interface for gradient color stops
interface GradientStop {
	color: string;
	position: number; // 0-1 position in the gradient
}

// Text effect options
interface TextEffectOptions {
	shadow?: {
		color: string;
		blur: number;
		offsetX: number;
		offsetY: number;
	};
	outline?: {
		color: string;
		width: number;
	};
}

// Theme definitions
const THEMES = {
	default: {
		progressBarColor: "#FF3C3C",
		progressBarBackgroundColor: "#2B2B2B",
		progressBarBorderColor: "#000000",
		textColor: "#FFFFFF",
		backgroundColor: "#1E1E1E",
		fontFamily: "sans-serif",
		avatarGlow: "#FF3C3C",
	},
	futuristic: {
		progressBarColor: "#00FFFF",
		progressBarBackgroundColor: "#001414",
		progressBarBorderColor: "#00AAAA",
		textColor: "#FFFFFF",
		backgroundColor: "#001133",
		fontFamily: "monospace",
		avatarGlow: "#00FFFF",
	},
	neon: {
		progressBarColor: "#FF00FF",
		progressBarBackgroundColor: "#330033",
		progressBarBorderColor: "#FF00FF",
		textColor: "#00FF00",
		backgroundColor: "#000000",
		fontFamily: "sans-serif",
		avatarGlow: "#FF00FF",
	},
	minimal: {
		progressBarColor: "#555555",
		progressBarBackgroundColor: "#EEEEEE",
		progressBarBorderColor: "#000000",
		textColor: "#000000",
		backgroundColor: "#FFFFFF",
		fontFamily: "sans-serif",
		avatarGlow: "rgba(0,0,0,0.3)",
	},
	aurora: {
		progressBarColor: "#7F3FBF",
		progressBarBackgroundColor: "#1A1A2E",
		progressBarBorderColor: "#4B0082",
		textColor: "#E6E6FA",
		backgroundColor: "#0A0A1A",
		fontFamily: "sans-serif",
		avatarGlow: "#7F3FBF",
	},
	sunset: {
		progressBarColor: "#FF8C00",
		progressBarBackgroundColor: "#4A2C2A",
		progressBarBorderColor: "#FF4500",
		textColor: "#FFFAF0",
		backgroundColor: "#3D0C02",
		fontFamily: "sans-serif",
		avatarGlow: "#FF8C00",
	},
};

type ThemeName = keyof typeof THEMES;

type LayoutType =
	| "classic"
	| "futuristicHUD"
	| "split"
	| "ribbon"
	| "diagonal"
	| "stacked";

interface LevelOptions {
	name: string;
	level: number;
	avatar: ImageInput | DiscordUser;
	xp: number;
	maxXp: number;
	nextLevelXp?: number;
	levelUpXp?: number;
	progress?: number;

	// Display options
	showNextLevelXp?: boolean;
	showLevelUpXp?: boolean;
	maxNameWidth?: number;

	// Theme
	theme?: ThemeName;

	layout?: LayoutType;

	// Progress bar
	progressBarColor?: string;
	progressBarBackgroundColor?: string;
	progressBarBorderColor?: string;
	progressBarBorderWidth?: number;
	progressBarBorderRadius?: number;
	progressBarBorderStyle?: string;
	progressBarBorderDashArray?: number[];
	progressBarGradient?: GradientStop[];

	// Text
	textColor?: string;
	fontSize?: number;
	bold?: boolean;
	fontFamily?: string;
	textEffect?: TextEffectOptions;

	// Background
	backgroundBlur?: number;
	backgroundOverlay?: string;
	backgroundImage?: ImageInput;

	// Avatar
	avatarGlow?: string;
	avatarGlowIntensity?: number;
	avatarSize?: number;
	avatarBorder?: string;
	avatarBorderWidth?: number;
}

/**
 * RankCard builder class for creating level cards with a chainable API
 */
export class RankCard {
	private name: string = "";
	private level: number = 1;
	private avatar: ImageInput | DiscordUser = "";
	private xp: number = 0;
	private maxXp: number = 100;
	private nextLevelXp?: number;
	private levelUpXp?: number;
	private progress?: number;

	// Display options
	private showNextLevelXp: boolean = true;
	private showLevelUpXp: boolean = true;
	private maxNameWidth: number = 300; // Default max width for name

	// Theme and styling
	private theme: ThemeName = "default";
	private layout: LayoutType = "classic"; // New layout property
	private progressBarColor?: string;
	private progressBarBackgroundColor?: string;
	private progressBarBorderColor?: string;
	private progressBarBorderWidth: number = 2;
	private progressBarBorderRadius: number = 0;
	private progressBarBorderStyle: string = "solid";
	private progressBarBorderDashArray: number[] = [];
	private progressBarGradient?: GradientStop[];
	private textColor?: string;
	private fontSize: number = 20;
	private bold: boolean = true;
	private fontFamily?: string;
	private textEffect: TextEffectOptions = {};

	// New design properties
	private backgroundBlur: number = 0;
	private backgroundOverlay: string = "rgba(0,0,0,0.5)";
	private backgroundImage?: ImageInput;
	private avatarGlow?: string;
	private avatarGlowIntensity: number = 15;
	private avatarSize: number = 100;
	private avatarBorder?: string;
	private avatarBorderWidth: number = 4;

	/**
	 * Create a new RankCard instance
	 * @param options Optional initial configuration
	 */
	constructor(options?: Partial<LevelOptions>) {
		if (options) {
			if (options.name) this.name = options.name;
			if (options.level) this.level = options.level;
			if (options.avatar) this.avatar = options.avatar;
			if (options.xp !== undefined) this.xp = options.xp;
			if (options.maxXp !== undefined) this.maxXp = options.maxXp;
			if (options.nextLevelXp !== undefined)
				this.nextLevelXp = options.nextLevelXp;
			if (options.levelUpXp !== undefined) this.levelUpXp = options.levelUpXp;
			if (options.progress !== undefined) this.progress = options.progress;

			// Display options
			if (options.showNextLevelXp !== undefined)
				this.showNextLevelXp = options.showNextLevelXp;
			if (options.showLevelUpXp !== undefined)
				this.showLevelUpXp = options.showLevelUpXp;
			if (options.maxNameWidth !== undefined)
				this.maxNameWidth = options.maxNameWidth;

			if (options.theme) this.theme = options.theme;
			if (options.layout) this.layout = options.layout; // New layout option

			// Override theme with specific options if provided
			if (options.progressBarColor)
				this.progressBarColor = options.progressBarColor;
			if (options.progressBarBackgroundColor)
				this.progressBarBackgroundColor = options.progressBarBackgroundColor;
			if (options.progressBarBorderColor)
				this.progressBarBorderColor = options.progressBarBorderColor;
			if (options.progressBarBorderWidth !== undefined)
				this.progressBarBorderWidth = options.progressBarBorderWidth;
			if (options.progressBarBorderRadius !== undefined)
				this.progressBarBorderRadius = options.progressBarBorderRadius;
			if (options.progressBarBorderStyle)
				this.progressBarBorderStyle = options.progressBarBorderStyle;
			if (options.progressBarBorderDashArray)
				this.progressBarBorderDashArray = options.progressBarBorderDashArray;
			if (options.progressBarGradient)
				this.progressBarGradient = options.progressBarGradient;
			if (options.textColor) this.textColor = options.textColor;
			if (options.fontSize !== undefined) this.fontSize = options.fontSize;
			if (options.bold !== undefined) this.bold = options.bold;
			if (options.fontFamily) this.fontFamily = options.fontFamily;
			if (options.textEffect) this.textEffect = options.textEffect;

			// New design properties
			if (options.backgroundBlur !== undefined)
				this.backgroundBlur = options.backgroundBlur;
			if (options.backgroundOverlay)
				this.backgroundOverlay = options.backgroundOverlay;
			if (options.backgroundImage)
				this.backgroundImage = options.backgroundImage;
			if (options.avatarGlow) this.avatarGlow = options.avatarGlow;
			if (options.avatarGlowIntensity !== undefined)
				this.avatarGlowIntensity = options.avatarGlowIntensity;
			if (options.avatarSize !== undefined)
				this.avatarSize = options.avatarSize;
			if (options.avatarBorder) this.avatarBorder = options.avatarBorder;
			if (options.avatarBorderWidth !== undefined)
				this.avatarBorderWidth = options.avatarBorderWidth;
		}
	}

	/**
	 * Set the user's name
	 */
	setName(name: string): RankCard {
		this.name = name;
		return this;
	}

	/**
	 * Set the user's level
	 */
	setLevel(level: number): RankCard {
		this.level = level;
		return this;
	}

	/**
	 * Set the user's avatar image
	 * Accepts URL, Buffer, or Discord user object
	 */
	setAvatar(avatar: ImageInput | DiscordUser): RankCard {
		this.avatar = avatar;
		return this;
	}

	/**
	 * Set the user's current XP
	 */
	setXP(xp: number): RankCard {
		this.xp = xp;
		return this;
	}

	/**
	 * Set the XP required for the current level
	 */
	setMaxXP(maxXp: number): RankCard {
		this.maxXp = maxXp;
		return this;
	}

	/**
	 * Set whether to show next level XP
	 */
	setShowNextLevelXp(show: boolean): RankCard {
		this.showNextLevelXp = show;
		return this;
	}

	/**
	 * Set whether to show level up XP
	 */
	setShowLevelUpXp(show: boolean): RankCard {
		this.showLevelUpXp = show;
		return this;
	}

	/**
	 * Set maximum width for the name text before wrapping
	 */
	setMaxNameWidth(width: number): RankCard {
		this.maxNameWidth = width;
		return this;
	}

	/**
	 * Set the XP required for the next level
	 */
	setNextLevelXP(nextLevelXp: number): RankCard {
		this.nextLevelXp = nextLevelXp;
		return this;
	}

	/**
	 * Set the remaining XP needed to level up
	 */
	setLevelUpXP(levelUpXp: number): RankCard {
		this.levelUpXp = levelUpXp;
		return this;
	}

	/**
	 * Set the progress ratio directly (0.0 to 1.0)
	 */
	setProgress(progress: number): RankCard {
		this.progress = Math.max(0, Math.min(1, progress));
		return this;
	}

	/**
	 * Set a predefined theme
	 */
	setTheme(theme: ThemeName): RankCard {
		this.theme = theme;
		return this;
	}

	/**
	 * Set progress bar color
	 */
	setProgressBarColor(color: string): RankCard {
		this.progressBarColor = color;
		return this;
	}

	/**
	 * Set a gradient for the progress bar
	 * @param stops Array of color stops with position (0-1)
	 */
	setProgressBarGradient(stops: GradientStop[]): RankCard {
		this.progressBarGradient = stops;
		return this;
	}

	/**
	 * Set progress bar background color
	 */
	setProgressBarBackgroundColor(color: string): RankCard {
		this.progressBarBackgroundColor = color;
		return this;
	}

	/**
	 * Set progress bar border color
	 */
	setProgressBarBorderColor(color: string): RankCard {
		this.progressBarBorderColor = color;
		return this;
	}

	/**
	 * Set progress bar border width
	 */
	setProgressBarBorderWidth(width: number): RankCard {
		this.progressBarBorderWidth = width;
		return this;
	}

	/**
	 * Set progress bar border radius
	 */
	setProgressBarBorderRadius(radius: number): RankCard {
		this.progressBarBorderRadius = radius;
		return this;
	}

	/**
	 * Set text color
	 */
	setTextColor(color: string): RankCard {
		this.textColor = color;
		return this;
	}

	/**
	 * Set font size
	 */
	setFontSize(size: number): RankCard {
		this.fontSize = size;
		return this;
	}

	/**
	 * Set bold text
	 */
	setBold(bold: boolean): RankCard {
		this.bold = bold;
		return this;
	}

	/**
	 * Set font family
	 */
	setFontFamily(fontFamily: string): RankCard {
		this.fontFamily = fontFamily;
		return this;
	}

	/**
	 * Add a shadow effect to text
	 */
	setTextShadow(
		color: string,
		blur: number = 3,
		offsetX: number = 2,
		offsetY: number = 2,
	): RankCard {
		this.textEffect.shadow = { color, blur, offsetX, offsetY };
		return this;
	}

	/**
	 * Remove text shadow effect
	 */
	removeTextShadow(): RankCard {
		this.textEffect.shadow = undefined;
		return this;
	}

	/**
	 * Add an outline effect to text
	 */
	setTextOutline(color: string, width: number = 2): RankCard {
		this.textEffect.outline = { color, width };
		return this;
	}

	/**
	 * Remove text outline effect
	 */
	removeTextOutline(): RankCard {
		this.textEffect.outline = undefined;
		return this;
	}

	/**
	 * Set background blur intensity
	 */
	setBackgroundBlur(blur: number): RankCard {
		this.backgroundBlur = blur;
		return this;
	}

	/**
	 * Set background overlay color
	 */
	setBackgroundOverlay(overlay: string): RankCard {
		this.backgroundOverlay = overlay;
		return this;
	}

	/**
	 * Set background image
	 */
	setBackgroundImage(image: ImageInput): RankCard {
		this.backgroundImage = image;
		return this;
	}

	/**
	 * Set avatar glow color
	 */
	setAvatarGlow(color: string): RankCard {
		this.avatarGlow = color;
		return this;
	}

	/**
	 * Set avatar glow intensity
	 */
	setAvatarGlowIntensity(intensity: number): RankCard {
		this.avatarGlowIntensity = intensity;
		return this;
	}

	/**
	 * Set avatar size
	 */
	setAvatarSize(size: number): RankCard {
		this.avatarSize = size;
		return this;
	}

	/**
	 * Set avatar border color
	 */
	setAvatarBorder(color: string): RankCard {
		this.avatarBorder = color;
		return this;
	}

	/**
	 * Set avatar border width
	 */
	setAvatarBorderWidth(width: number): RankCard {
		this.avatarBorderWidth = width;
		return this;
	}

	/**
	 * Set the card layout style
	 */
	setLayout(layout: LayoutType): RankCard {
		this.layout = layout;
		return this;
	}

	/**
	 * Convert Discord user to avatar URL
	 */
	private getAvatarURL(user: DiscordUser): string {
		const { id, avatar } = user;

		// Error handling: if empty avatar, use Discord's default avatar
		if (!avatar) {
			const defaultIndex = parseInt(id, 10) % 5;
			return `https://cdn.discordapp.com/embed/avatars/${defaultIndex}.png`;
		}

		// Handle animated avatars that start with 'a_'
		const extension = avatar.startsWith("a_") ? "gif" : "png";
		return `https://cdn.discordapp.com/avatars/${id}/${avatar}.${extension}?size=256`;
	}

	/**
	 * Load and validate avatar image
	 */
	private async loadAvatar(): Promise<ImageInput> {
		if (!this.avatar) {
			throw new Error("Avatar must be provided. Use setAvatar() method.");
		}

		let avatarURL: ImageInput;
		if (
			typeof this.avatar === "object" &&
			"id" in this.avatar &&
			"avatar" in this.avatar
		) {
			try {
				avatarURL = this.getAvatarURL(this.avatar);
				console.log(`Generated Discord avatar URL: ${avatarURL}`);
			} catch (_error) {
				console.warn(
					"Error generating Discord avatar URL, using fallback image",
				);
				return "https://i.pravatar.cc/300";
			}
		} else {
			avatarURL = this.avatar as ImageInput;
		}

		try {
			const isValidAvatar = await validateURL(avatarURL);
			if (!isValidAvatar) {
				console.warn("Avatar URL validation failed, using fallback image");
				return "https://i.pravatar.cc/300";
			}
			return isValidAvatar; // validateURL returns the buffer if valid
		} catch (error) {
			console.warn("Avatar validation error, using fallback image:", error);
			return "https://i.pravatar.cc/300";
		}
	}

	/**
	 * Wrap text to fit within maxWidth
	 */
	private wrapText(ctx: any, text: string, maxWidth: number): string[] {
		const words = text.split(" ");
		const lines = [];
		let currentLine = words[0];

		for (let i = 1; i < words.length; i++) {
			const word = words[i];
			const width = ctx.measureText(`${currentLine} ${word}`).width;
			if (width < maxWidth) {
				currentLine += ` ${word}`;
			} else {
				lines.push(currentLine);
				currentLine = word;
			}
		}
		lines.push(currentLine);
		return lines;
	}

	/**
	 * Draw text elements on the canvas
	 */
	private drawText(ctx: any, textX: number, currentY: number): number {
		const fontWeight = this.bold ? "bold" : "normal";
		const fontFamily = this.fontFamily || THEMES[this.theme].fontFamily;
		ctx.font = `${fontWeight} ${this.fontSize}px ${fontFamily}`;
		ctx.fillStyle = this.textColor || THEMES[this.theme].textColor;

		// Apply text effects if enabled
		if (this.textEffect.shadow) {
			const { color, blur, offsetX, offsetY } = this.textEffect.shadow;
			ctx.shadowColor = color;
			ctx.shadowBlur = blur;
			ctx.shadowOffsetX = offsetX;
			ctx.shadowOffsetY = offsetY;
		}

		// Handle text outline separately if enabled
		const hasOutline = !!this.textEffect.outline;

		// Draw name (possibly multi-line)
		const nameLines = this.wrapText(ctx, this.name, this.maxNameWidth);
		for (const line of nameLines) {
			if (this.textEffect.outline) {
				const { color, width } = this.textEffect.outline;
				ctx.strokeStyle = color;
				ctx.lineWidth = width;
				ctx.strokeText(line, textX, currentY);
			}
			ctx.fillText(line, textX, currentY);
			currentY += this.fontSize + 5;
		}

		currentY += 5; // Add a bit more spacing after name

		// Draw level with outline if enabled
		const levelText = `Level: ${this.level}`;
		if (this.textEffect.outline) {
			const { color, width } = this.textEffect.outline;
			ctx.strokeStyle = color;
			ctx.lineWidth = width;
			ctx.strokeText(levelText, textX, currentY);
		}
		ctx.fillText(levelText, textX, currentY);
		currentY += this.fontSize + 10;

		// Draw XP
		const xpText = `XP: ${this.xp} / ${this.maxXp}`;
		if (hasOutline) {
			ctx.strokeText(xpText, textX, currentY);
		}
		ctx.fillText(xpText, textX, currentY);
		currentY += this.fontSize + 10;

		// Draw Next Level XP if enabled
		if (this.showNextLevelXp) {
			const nextLevelXpValue =
				this.nextLevelXp !== undefined ? this.nextLevelXp : this.maxXp;
			const nextLevelText = `Next Level: ${nextLevelXpValue} XP`;
			if (hasOutline) {
				ctx.strokeText(nextLevelText, textX, currentY);
			}
			ctx.fillText(nextLevelText, textX, currentY);
			currentY += this.fontSize + 10;
		}

		// Draw Level Up XP if enabled
		if (this.showLevelUpXp) {
			const levelUpXpValue =
				this.levelUpXp !== undefined ? this.levelUpXp : this.maxXp - this.xp;
			const levelUpText = `XP needed: ${levelUpXpValue}`;
			if (hasOutline) {
				ctx.strokeText(levelUpText, textX, currentY);
			}
			ctx.fillText(levelUpText, textX, currentY);
			currentY += this.fontSize + 10;
		}

		// Reset shadow settings
		ctx.shadowColor = "transparent";
		ctx.shadowBlur = 0;
		ctx.shadowOffsetX = 0;
		ctx.shadowOffsetY = 0;

		return currentY;
	}

	/**
	 * Draw progress bar on the canvas
	 */
	private drawProgressBar(
		ctx: any,
		progress: number,
		x: number,
		y: number,
		width: number,
		height: number,
	) {
		const progressBarBackgroundColor =
			this.progressBarBackgroundColor ||
			THEMES[this.theme].progressBarBackgroundColor;
		const progressBarBorderColor =
			this.progressBarBorderColor || THEMES[this.theme].progressBarBorderColor;

		// Draw the background of the progress bar
		ctx.fillStyle = progressBarBackgroundColor;

		// Apply border radius if specified
		if (this.progressBarBorderRadius > 0) {
			roundRect(ctx, x, y, width, height, this.progressBarBorderRadius);
			ctx.fill();
		} else {
			ctx.fillRect(x, y, width, height);
		}

		// Calculate progress and draw the filled part
		const filledWidth = width * progress;

		// Create gradient if specified, otherwise use solid color
		if (this.progressBarGradient && this.progressBarGradient.length > 1) {
			const gradient = ctx.createLinearGradient(x, y, x + filledWidth, y);
			this.progressBarGradient.forEach((stop) => {
				gradient.addColorStop(stop.position, stop.color);
			});
			ctx.fillStyle = gradient;
		} else {
			ctx.fillStyle =
				this.progressBarColor || THEMES[this.theme].progressBarColor;
		}

		if (this.progressBarBorderRadius > 0) {
			roundRect(ctx, x, y, filledWidth, height, this.progressBarBorderRadius);
			ctx.fill();
		} else {
			ctx.fillRect(x, y, filledWidth, height);
		}

		// Draw a border around the progress bar
		ctx.strokeStyle = progressBarBorderColor;
		ctx.lineWidth = this.progressBarBorderWidth;

		// Apply dash array if specified
		if (this.progressBarBorderDashArray.length > 0) {
			ctx.setLineDash(this.progressBarBorderDashArray);
		}

		if (this.progressBarBorderRadius > 0) {
			roundRect(ctx, x, y, width, height, this.progressBarBorderRadius);
			ctx.stroke();
		} else {
			ctx.strokeRect(x, y, width, height);
		}

		// Reset line dash
		ctx.setLineDash([]);
	}

	/**
	 * Render the rank card and return a buffer
	 */
	async render(): Promise<Buffer> {
		// Validate required fields
		if (!this.name) {
			throw new Error("Name must be provided. Use setName() method.");
		}

		if (this.level < 0 || this.xp < 0 || this.maxXp < 0) {
			throw new Error("Level, xp, and maxXp must be non-negative numbers.");
		}

		// Load and validate avatar
		const avatarURL = await this.loadAvatar();

		// Calculate default values if not provided
		const progressValue =
			this.progress !== undefined
				? this.progress
				: Math.min(this.xp / this.maxXp, 1);

		// Canvas dimensions
		const width = 800;
		const height = 400;
		const canvas = createCanvas(width, height);
		const ctx = canvas.getContext("2d");

		// Get theme config
		const themeConfig = THEMES[this.theme];

		// Choose layout based on layout type
		switch (this.layout) {
			case "futuristicHUD":
				await this.renderFuturisticHUD(
					ctx,
					width,
					height,
					themeConfig,
					avatarURL,
					progressValue,
				);
				break;
			default:
				await this.renderClassicLayout(
					ctx,
					width,
					height,
					themeConfig,
					avatarURL,
					progressValue,
				);
				break;
		}

		return canvas.toBuffer();
	}

	// Move the existing render code to a new method for the classic layout
	private async renderClassicLayout(
		ctx: any,
		width: number,
		height: number,
		themeConfig: any,
		avatarURL: ImageInput,
		progressValue: number,
	): Promise<void> {
		// --- Draw background ---
		if (this.backgroundImage) {
			try {
				const bgImage = await loadImage(this.backgroundImage);
				ctx.drawImage(bgImage, 0, 0, width, height);

				// Apply blur if specified
				if (this.backgroundBlur > 0) {
					// Simulate blur by drawing a semi-transparent overlay
					ctx.fillStyle = "rgba(0,0,0,0.5)";
					for (let i = 0; i < this.backgroundBlur; i++) {
						ctx.fillRect(0, 0, width, height);
					}
				}
			} catch (_error) {
				console.warn(
					"Failed to load background image, using generated background",
				);
				this.drawGeneratedBackground(ctx, width, height, themeConfig);
			}
		} else {
			// Use generated background instead of solid color
			this.drawGeneratedBackground(ctx, width, height, themeConfig);
		}

		// Apply overlay
		ctx.fillStyle = this.backgroundOverlay;
		ctx.fillRect(0, 0, width, height);

		// --- Draw card frame ---
		// Add a subtle inner glow to the card
		const cardMargin = 20;
		const cornerRadius = 15;

		// Draw card background with rounded corners
		ctx.save();
		roundRect(
			ctx,
			cardMargin,
			cardMargin,
			width - cardMargin * 2,
			height - cardMargin * 2,
			cornerRadius,
		);
		ctx.clip();

		// Create gradient for card background
		const cardGradient = ctx.createLinearGradient(0, 0, width, height);
		cardGradient.addColorStop(0, `rgba(30, 30, 40, 0.7)`);
		cardGradient.addColorStop(1, `rgba(20, 20, 30, 0.8)`);
		ctx.fillStyle = cardGradient;
		ctx.fillRect(
			cardMargin,
			cardMargin,
			width - cardMargin * 2,
			height - cardMargin * 2,
		);

		// Add subtle highlight at the top
		const highlightGradient = ctx.createLinearGradient(
			0,
			cardMargin,
			0,
			cardMargin + 70,
		);
		highlightGradient.addColorStop(0, `rgba(255, 255, 255, 0.1)`);
		highlightGradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
		ctx.fillStyle = highlightGradient;
		ctx.fillRect(cardMargin, cardMargin, width - cardMargin * 2, 70);

		ctx.restore();

		// Draw card border with rounded corners
		ctx.strokeStyle = `rgba(255, 255, 255, 0.1)`;
		ctx.lineWidth = 1;
		roundRect(
			ctx,
			cardMargin,
			cardMargin,
			width - cardMargin * 2,
			height - cardMargin * 2,
			cornerRadius,
		);
		ctx.stroke();

		// --- Draw avatar with glow effect ---
		let avatarImg: any;
		try {
			avatarImg = await loadImage(avatarURL);
		} catch (_error) {
			throw new Error("Failed to load avatar image.");
		}

		const avatarX = 50;
		const avatarY = 80;

		// Draw avatar glow if enabled
		const avatarGlowColor = this.avatarGlow || themeConfig.avatarGlow;
		if (avatarGlowColor) {
			ctx.save();
			ctx.shadowColor = avatarGlowColor;
			ctx.shadowBlur = this.avatarGlowIntensity;

			// Draw a circle for the glow effect
			ctx.beginPath();
			ctx.arc(
				avatarX + this.avatarSize / 2,
				avatarY + this.avatarSize / 2,
				this.avatarSize / 2,
				0,
				Math.PI * 2,
				false,
			);
			ctx.closePath();
			ctx.fillStyle = avatarGlowColor;
			ctx.fill();
			ctx.restore();
		}

		// Draw avatar border if specified
		if (this.avatarBorder) {
			ctx.save();
			ctx.beginPath();
			ctx.arc(
				avatarX + this.avatarSize / 2,
				avatarY + this.avatarSize / 2,
				this.avatarSize / 2 + this.avatarBorderWidth / 2,
				0,
				Math.PI * 2,
				false,
			);
			ctx.closePath();
			ctx.strokeStyle = this.avatarBorder;
			ctx.lineWidth = this.avatarBorderWidth;
			ctx.stroke();
			ctx.restore();
		}

		// Create a circular clip for the avatar
		ctx.save();
		ctx.beginPath();
		ctx.arc(
			avatarX + this.avatarSize / 2,
			avatarY + this.avatarSize / 2,
			this.avatarSize / 2,
			0,
			Math.PI * 2,
			false,
		);
		ctx.closePath();
		ctx.clip();
		ctx.drawImage(
			avatarImg,
			avatarX,
			avatarY,
			this.avatarSize,
			this.avatarSize,
		);
		ctx.restore();

		// --- Draw text ---
		const textX = avatarX + this.avatarSize + 30;
		let currentY = avatarY + this.fontSize;
		currentY = this.drawText(ctx, textX, currentY);

		// --- Draw progress bar ---
		const progressBarWidth = width - 100;
		const progressBarHeight = 30;
		const progressBarX = 50;
		const progressBarY = height - 80;

		// Create a container with background for progress
		ctx.save();
		// Add a subtle glow to the progress bar
		ctx.shadowColor = this.progressBarColor || themeConfig.progressBarColor;
		ctx.shadowBlur = 10;
		ctx.shadowOffsetX = 0;
		ctx.shadowOffsetY = 0;

		// Draw the progress bar with improved visuals
		this.drawProgressBar(
			ctx,
			progressValue,
			progressBarX,
			progressBarY,
			progressBarWidth,
			progressBarHeight,
		);
		ctx.restore();
	}

	// New implementation for the futuristic HUD layout
	private async renderFuturisticHUD(
		ctx: any,
		width: number,
		height: number,
		themeConfig: any,
		avatarURL: ImageInput,
		progressValue: number,
	): Promise<void> {
		// Load the avatar
		let avatarImg: any;
		try {
			avatarImg = await loadImage(avatarURL);
		} catch (_error) {
			throw new Error("Failed to load avatar image.");
		}

		// --- Draw background ---
		if (this.backgroundImage) {
			try {
				const bgImage = await loadImage(this.backgroundImage);
				ctx.drawImage(bgImage, 0, 0, width, height);

				// Apply dark overlay for readability
				ctx.fillStyle = "rgba(0,10,30,0.7)";
				ctx.fillRect(0, 0, width, height);
			} catch (_error) {
				console.warn(
					"Failed to load background image, using generated tech pattern",
				);
				this.drawTechPattern(ctx, width, height, themeConfig);
			}
		} else {
			// Use tech pattern as background
			this.drawTechPattern(ctx, width, height, themeConfig);
		}

		// Apply an additional overlay for the HUD feel
		const overlayGradient = ctx.createLinearGradient(0, 0, width, 0);
		overlayGradient.addColorStop(0, "rgba(0,20,50,0.4)");
		overlayGradient.addColorStop(0.5, "rgba(0,10,30,0.2)");
		overlayGradient.addColorStop(1, "rgba(0,20,50,0.4)");
		ctx.fillStyle = overlayGradient;
		ctx.fillRect(0, 0, width, height);

		// Add scan line effect
		this.drawScanLines(ctx, width, height);

		// --- Draw futuristic frame elements ---
		const accentColor = themeConfig.progressBarColor || "#00FFFF";
		const dimAccentColor = this.adjustColorAlpha(accentColor, 0.3);

		// Draw corner elements
		this.drawHUDCorners(ctx, width, height, accentColor);

		// Draw avatar area with hexagonal frame
		const avatarSize = this.avatarSize * 1.2; // Make avatar slightly bigger for this layout
		const avatarX = 70;
		const avatarY = height / 2 - avatarSize / 2;

		// Draw hexagonal avatar frame with glow
		this.drawHexagonalAvatar(
			ctx,
			avatarX,
			avatarY,
			avatarSize,
			avatarImg,
			accentColor,
		);

		// Add decorative HUD elements around avatar
		this.drawAvatarHUDElements(
			ctx,
			avatarX,
			avatarY,
			avatarSize,
			accentColor,
			dimAccentColor,
		);

		// Draw futuristic text area with angles and shapes
		const textStartX = avatarX + avatarSize + 60;
		const textWidth = width - textStartX - 60; // Padding on right side
		const textY = height / 3 - 20;

		// Draw angled header bar
		this.drawAngledHeader(
			ctx,
			textStartX,
			textY,
			textWidth,
			accentColor,
			this.name,
		);

		// Draw level badge
		const levelBadgeX = textStartX;
		const levelBadgeY = textY + 70;
		this.drawHexLevelBadge(
			ctx,
			levelBadgeX,
			levelBadgeY,
			this.level,
			accentColor,
		);

		// Draw stats display
		const statsX = levelBadgeX + 120;
		const statsY = levelBadgeY + 10;
		this.drawFuturisticStats(ctx, statsX, statsY, accentColor);

		// Draw segmented hex progress bar
		const progressBarY = height - 100;
		const progressBarX = textStartX;
		const progressBarWidth = textWidth;
		this.drawHexProgressBar(
			ctx,
			progressBarX,
			progressBarY,
			progressBarWidth,
			40,
			progressValue,
			accentColor,
		);

		// Add decorative data lines
		this.drawDataLines(ctx, width, height, accentColor);

		// Add a subtle blue vignette effect for depth
		this.drawVignette(ctx, width, height, 0.4);
	}

	// Helper methods for the futuristic HUD layout
	private drawScanLines(ctx: any, width: number, height: number): void {
		ctx.globalAlpha = 0.05;
		ctx.fillStyle = "#FFFFFF";

		for (let y = 0; y < height; y += 2) {
			ctx.fillRect(0, y, width, 1);
		}

		ctx.globalAlpha = 1;
	}

	private drawHUDCorners(
		ctx: any,
		width: number,
		height: number,
		color: string,
	): void {
		const cornerSize = 60;
		const lineWidth = 2;

		ctx.strokeStyle = color;
		ctx.lineWidth = lineWidth;
		ctx.shadowColor = color;
		ctx.shadowBlur = 10;

		// Top-left corner
		ctx.beginPath();
		ctx.moveTo(0, cornerSize);
		ctx.lineTo(0, 0);
		ctx.lineTo(cornerSize, 0);
		ctx.stroke();

		// Top-right corner
		ctx.beginPath();
		ctx.moveTo(width - cornerSize, 0);
		ctx.lineTo(width, 0);
		ctx.lineTo(width, cornerSize);
		ctx.stroke();

		// Bottom-left corner
		ctx.beginPath();
		ctx.moveTo(0, height - cornerSize);
		ctx.lineTo(0, height);
		ctx.lineTo(cornerSize, height);
		ctx.stroke();

		// Bottom-right corner
		ctx.beginPath();
		ctx.moveTo(width - cornerSize, height);
		ctx.lineTo(width, height);
		ctx.lineTo(width, height - cornerSize);
		ctx.stroke();

		// Reset shadow
		ctx.shadowBlur = 0;
	}

	private drawHexagonalAvatar(
		ctx: any,
		x: number,
		y: number,
		size: number,
		avatarImg: any,
		color: string,
	): void {
		const hexRadius = size / 2;
		const centerX = x + hexRadius;
		const centerY = y + hexRadius;

		// Draw outer glow
		ctx.shadowColor = color;
		ctx.shadowBlur = 15;
		ctx.strokeStyle = color;
		ctx.lineWidth = 3;

		// Draw hexagon
		ctx.beginPath();
		for (let i = 0; i < 6; i++) {
			const angle = (i * Math.PI) / 3 - Math.PI / 2;
			const hx = centerX + hexRadius * Math.cos(angle);
			const hy = centerY + hexRadius * Math.sin(angle);
			if (i === 0) {
				ctx.moveTo(hx, hy);
			} else {
				ctx.lineTo(hx, hy);
			}
		}
		ctx.closePath();
		ctx.stroke();

		// Reset shadow for the clip
		ctx.shadowBlur = 0;

		// Clip to hexagon for avatar
		ctx.save();
		ctx.beginPath();
		for (let i = 0; i < 6; i++) {
			const angle = (i * Math.PI) / 3 - Math.PI / 2;
			const hx = centerX + (hexRadius - 2) * Math.cos(angle);
			const hy = centerY + (hexRadius - 2) * Math.sin(angle);
			if (i === 0) {
				ctx.moveTo(hx, hy);
			} else {
				ctx.lineTo(hx, hy);
			}
		}
		ctx.closePath();
		ctx.clip();

		// Draw avatar inside hex clip
		ctx.drawImage(avatarImg, x, y, size, size);
		ctx.restore();

		// Add inner highlight
		ctx.strokeStyle = this.adjustColorAlpha(color, 0.3);
		ctx.lineWidth = 1;
		ctx.beginPath();
		for (let i = 0; i < 6; i++) {
			const angle = (i * Math.PI) / 3 - Math.PI / 2;
			const hx = centerX + (hexRadius - 5) * Math.cos(angle);
			const hy = centerY + (hexRadius - 5) * Math.sin(angle);
			if (i === 0) {
				ctx.moveTo(hx, hy);
			} else {
				ctx.lineTo(hx, hy);
			}
		}
		ctx.closePath();
		ctx.stroke();
	}

	private drawAvatarHUDElements(
		ctx: any,
		x: number,
		y: number,
		size: number,
		color: string,
		dimColor: string,
	): void {
		const centerX = x + size / 2;
		const centerY = y + size / 2;
		const radius = size / 2;

		// Draw circular indicators
		ctx.strokeStyle = dimColor;
		ctx.lineWidth = 1;

		// Outer circle
		ctx.beginPath();
		ctx.arc(centerX, centerY, radius + 10, 0, Math.PI * 2);
		ctx.stroke();

		// Arc segments
		for (let i = 0; i < 4; i++) {
			const startAngle = (i * Math.PI) / 2;
			const endAngle = startAngle + Math.PI / 4;

			ctx.beginPath();
			ctx.arc(centerX, centerY, radius + 15, startAngle, endAngle);
			ctx.stroke();
		}

		// Add small indicators
		const indicatorPositions = [
			{ angle: Math.PI / 4, distance: radius + 20 },
			{ angle: (Math.PI * 3) / 4, distance: radius + 20 },
			{ angle: (Math.PI * 5) / 4, distance: radius + 20 },
			{ angle: (Math.PI * 7) / 4, distance: radius + 20 },
		];

		for (const pos of indicatorPositions) {
			const ix = centerX + Math.cos(pos.angle) * pos.distance;
			const iy = centerY + Math.sin(pos.angle) * pos.distance;

			ctx.fillStyle = color;
			ctx.beginPath();
			ctx.arc(ix, iy, 2, 0, Math.PI * 2);
			ctx.fill();

			// Small connecting line
			ctx.beginPath();
			ctx.moveTo(ix, iy);
			ctx.lineTo(ix + Math.cos(pos.angle) * 10, iy + Math.sin(pos.angle) * 10);
			ctx.stroke();
		}
	}

	private drawAngledHeader(
		ctx: any,
		x: number,
		y: number,
		width: number,
		color: string,
		name: string,
	): void {
		const height = 40;
		const angleWidth = 20;

		// Draw the angled background shape
		ctx.fillStyle = this.adjustColorAlpha(color, 0.1);
		ctx.strokeStyle = color;
		ctx.lineWidth = 2;
		ctx.shadowColor = color;
		ctx.shadowBlur = 5;

		ctx.beginPath();
		ctx.moveTo(x, y);
		ctx.lineTo(x + width, y);
		ctx.lineTo(x + width - angleWidth, y + height);
		ctx.lineTo(x, y + height);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Reset shadow for text
		ctx.shadowBlur = 0;

		// Draw name text
		ctx.font = `bold 28px monospace`;
		ctx.fillStyle = color;
		ctx.shadowColor = color;
		ctx.shadowBlur = 10;
		ctx.fillText(name.toUpperCase(), x + 20, y + height - 12);

		ctx.shadowBlur = 0;

		// Add small decorative elements
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.moveTo(x + width - angleWidth - 50, y);
		ctx.lineTo(x + width - angleWidth - 30, y);
		ctx.lineTo(x + width - angleWidth - 40, y + 10);
		ctx.closePath();
		ctx.fill();
	}

	private drawHexLevelBadge(
		ctx: any,
		x: number,
		y: number,
		level: number,
		color: string,
	): void {
		const size = 50;
		const hexRadius = size / 2;

		// Draw hex background
		ctx.fillStyle = this.adjustColorAlpha(color, 0.15);
		ctx.strokeStyle = color;
		ctx.lineWidth = 2;
		ctx.shadowColor = color;
		ctx.shadowBlur = 10;

		ctx.beginPath();
		for (let i = 0; i < 6; i++) {
			const angle = (i * Math.PI) / 3;
			const hx = x + hexRadius + hexRadius * Math.cos(angle);
			const hy = y + hexRadius + hexRadius * Math.sin(angle);
			if (i === 0) {
				ctx.moveTo(hx, hy);
			} else {
				ctx.lineTo(hx, hy);
			}
		}
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Draw level text
		ctx.shadowBlur = 0;
		ctx.font = "bold 24px monospace";
		ctx.fillStyle = "#FFFFFF";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";

		const textX = x + hexRadius;
		const textY = y + hexRadius + 1;

		// Text shadow for better readability
		ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
		ctx.shadowBlur = 4;
		ctx.fillText(level.toString(), textX, textY);
		ctx.shadowBlur = 0;

		// Reset text alignment
		ctx.textAlign = "left";
		ctx.textBaseline = "alphabetic";

		// Add "LVL" label
		ctx.font = "bold 14px monospace";
		ctx.fillStyle = color;
		ctx.fillText("LVL", x + size + 5, y + hexRadius);
	}

	private drawFuturisticStats(
		ctx: any,
		x: number,
		y: number,
		color: string,
	): void {
		const labelColor = "#FFFFFF";
		const valueColor = color;
		const lineColor = this.adjustColorAlpha(color, 0.3);
		const lineHeight = 30;

		ctx.font = "16px monospace";

		// Current XP stat
		ctx.fillStyle = labelColor;
		ctx.fillText("CURRENT XP:", x, y);
		ctx.fillStyle = valueColor;
		ctx.fillText(`${this.xp}`, x + 130, y);

		// Horizontal separator line
		ctx.strokeStyle = lineColor;
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(x, y + 10);
		ctx.lineTo(x + 250, y + 10);
		ctx.stroke();

		// Max XP stat
		ctx.fillStyle = labelColor;
		ctx.fillText("MAX XP:", x, y + lineHeight);
		ctx.fillStyle = valueColor;
		ctx.fillText(`${this.maxXp}`, x + 130, y + lineHeight);

		// Separator line
		ctx.beginPath();
		ctx.moveTo(x, y + lineHeight + 10);
		ctx.lineTo(x + 250, y + lineHeight + 10);
		ctx.stroke();

		// Next level stat, if enabled
		if (this.showNextLevelXp) {
			const nextLevelXpValue =
				this.nextLevelXp !== undefined ? this.nextLevelXp : this.maxXp;
			ctx.fillStyle = labelColor;
			ctx.fillText("NEXT LEVEL:", x, y + lineHeight * 2);
			ctx.fillStyle = valueColor;
			ctx.fillText(`${nextLevelXpValue} XP`, x + 130, y + lineHeight * 2);

			// Separator line
			ctx.beginPath();
			ctx.moveTo(x, y + lineHeight * 2 + 10);
			ctx.lineTo(x + 250, y + lineHeight * 2 + 10);
			ctx.stroke();
		}

		// XP needed stat, if enabled
		if (this.showLevelUpXp) {
			const yPos = this.showNextLevelXp
				? y + lineHeight * 3
				: y + lineHeight * 2;
			const levelUpXpValue =
				this.levelUpXp !== undefined ? this.levelUpXp : this.maxXp - this.xp;

			ctx.fillStyle = labelColor;
			ctx.fillText("XP NEEDED:", x, yPos);
			ctx.fillStyle = valueColor;
			ctx.fillText(`${levelUpXpValue}`, x + 130, yPos);
		}
	}

	private drawHexProgressBar(
		ctx: any,
		x: number,
		y: number,
		width: number,
		_height: number,
		progress: number,
		color: string,
	): void {
		const segments = 12;
		const segmentWidth = (width - 60) / segments; // Leave space on ends for decorations
		const segmentPadding = 4;
		const _segmentSize = segmentWidth - segmentPadding;
		const filledSegments = Math.floor(progress * segments);

		// Draw progress text
		ctx.font = "bold 16px monospace";
		ctx.fillStyle = "#FFFFFF";
		ctx.fillText("PROGRESS:", x, y - 10);

		// Draw percentage indicator
		const percentText = `${Math.round(progress * 100)}%`;
		ctx.font = "bold 20px monospace";
		ctx.fillStyle = color;
		ctx.textAlign = "right";
		ctx.fillText(percentText, x + width, y - 10);
		ctx.textAlign = "left";

		// Draw background bar
		ctx.fillStyle = this.adjustColorAlpha(color, 0.1);
		ctx.strokeStyle = this.adjustColorAlpha(color, 0.3);
		ctx.lineWidth = 1;

		// Draw progress bar background with slight angle
		const barHeight = 16;
		const barY = y + 10;
		const angleWidth = 15;

		ctx.beginPath();
		ctx.moveTo(x, barY);
		ctx.lineTo(x + width, barY);
		ctx.lineTo(x + width - angleWidth, barY + barHeight);
		ctx.lineTo(x + angleWidth, barY + barHeight);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Add decorative elements at ends
		ctx.fillStyle = color;

		// Left cap
		ctx.beginPath();
		ctx.moveTo(x, barY);
		ctx.lineTo(x + 8, barY);
		ctx.lineTo(x + 8, barY + 8);
		ctx.closePath();
		ctx.fill();

		// Right cap
		ctx.beginPath();
		ctx.moveTo(x + width, barY);
		ctx.lineTo(x + width - 8, barY);
		ctx.lineTo(x + width - 8, barY + 8);
		ctx.closePath();
		ctx.fill();

		// Draw hexagonal segments
		const startX = x + 30; // Start after left decoration

		for (let i = 0; i < segments; i++) {
			const segX = startX + i * segmentWidth;
			const segY = barY + barHeight / 2 - 6;

			// Draw segment
			ctx.beginPath();

			// Draw a hexagon for each segment
			for (let j = 0; j < 6; j++) {
				const angle = (j * Math.PI) / 3;
				const hx = segX + 6 + 6 * Math.cos(angle);
				const hy = segY + 6 + 6 * Math.sin(angle);
				if (j === 0) {
					ctx.moveTo(hx, hy);
				} else {
					ctx.lineTo(hx, hy);
				}
			}

			ctx.closePath();

			if (i < filledSegments) {
				// Filled segment
				ctx.fillStyle = color;
				ctx.fill();

				// Add glow to filled segments
				ctx.shadowColor = color;
				ctx.shadowBlur = 8;
				ctx.strokeStyle = this.adjustColorBrightness(color, 0.2);
				ctx.stroke();
				ctx.shadowBlur = 0;
			} else {
				// Empty segment
				ctx.fillStyle = "rgba(30, 30, 40, 0.6)";
				ctx.fill();
				ctx.strokeStyle = this.adjustColorAlpha(color, 0.3);
				ctx.stroke();
			}
		}

		// Draw animated "scanning" highlight effect
		const time = Date.now() * 0.001;
		const scanPos = (time % 2) / 2; // 0 to 1 every 2 seconds

		if (scanPos < progress) {
			const scanX = startX + scanPos * segments * segmentWidth;
			const gradientWidth = 50;

			const scanGradient = ctx.createLinearGradient(
				scanX - gradientWidth / 2,
				0,
				scanX + gradientWidth / 2,
				0,
			);

			scanGradient.addColorStop(0, "rgba(255, 255, 255, 0)");
			scanGradient.addColorStop(0.5, this.adjustColorAlpha(color, 0.7));
			scanGradient.addColorStop(1, "rgba(255, 255, 255, 0)");

			ctx.fillStyle = scanGradient;
			ctx.globalCompositeOperation = "lighter";
			ctx.fillRect(startX, barY, progress * segments * segmentWidth, barHeight);
			ctx.globalCompositeOperation = "source-over";
		}
	}

	private drawDataLines(
		ctx: any,
		width: number,
		height: number,
		color: string,
	): void {
		const lineColor = this.adjustColorAlpha(color, 0.2);
		ctx.strokeStyle = lineColor;
		ctx.lineWidth = 1;

		// Bottom right area data pattern
		const patternX = width - 200;
		const patternY = height - 180;
		const patternSize = 150;

		// Draw data pattern
		for (let i = 0; i < 5; i++) {
			const y = patternY + i * 20;

			// Horizontal line with break
			ctx.beginPath();
			ctx.moveTo(patternX, y);
			ctx.lineTo(patternX + 30, y);
			ctx.moveTo(patternX + 50, y);
			ctx.lineTo(patternX + patternSize, y);
			ctx.stroke();

			// Small vertical connectors
			if (i < 4) {
				ctx.beginPath();
				ctx.moveTo(patternX + 15 + i * 30, y);
				ctx.lineTo(patternX + 15 + i * 30, y + 20);
				ctx.stroke();
			}
		}

		// Add some random "data" dots
		ctx.fillStyle = color;
		for (let i = 0; i < 12; i++) {
			const dotX = patternX + Math.random() * patternSize;
			const dotY = patternY + Math.random() * 80;

			if (Math.random() > 0.7) {
				ctx.beginPath();
				ctx.arc(dotX, dotY, 1.5, 0, Math.PI * 2);
				ctx.fill();
			}
		}

		// Add vertical data "meter" in bottom left
		const meterX = 30;
		const meterY = height - 90;
		const meterHeight = 70;

		// Draw meter background
		ctx.strokeStyle = lineColor;
		ctx.strokeRect(meterX, meterY, 15, meterHeight);

		// Draw meter level (animated)
		const time = Date.now() * 0.001;
		const meterLevel = 0.3 + Math.sin(time) * 0.2; // 0.1 to 0.5

		ctx.fillStyle = color;
		ctx.fillRect(
			meterX,
			meterY + meterHeight * (1 - meterLevel),
			15,
			meterHeight * meterLevel,
		);

		// Add small connecting lines
		for (let i = 0; i < 4; i++) {
			const lineY = meterY + (i * meterHeight) / 3;

			ctx.beginPath();
			ctx.moveTo(meterX + 15, lineY);
			ctx.lineTo(meterX + 25, lineY);
			ctx.stroke();
		}
	}

	/**
	 * Draw a programmatically generated background based on theme
	 */
	private drawGeneratedBackground(
		ctx: any,
		width: number,
		height: number,
		themeConfig: any,
	) {
		// Get a pattern type based on theme
		const patternType = this.getPatternTypeForTheme(this.theme);

		// Base background fill
		ctx.fillStyle = themeConfig.backgroundColor;
		ctx.fillRect(0, 0, width, height);

		switch (patternType) {
			case "noise":
				this.drawNoiseGradient(ctx, width, height, themeConfig);
				break;
			case "tech":
				this.drawTechPattern(ctx, width, height, themeConfig);
				break;
			case "glow":
				this.drawGlowPattern(ctx, width, height, themeConfig);
				break;
			case "subtle":
				this.drawSubtlePattern(ctx, width, height, themeConfig);
				break;
			case "flow":
				this.drawFlowPattern(ctx, width, height, themeConfig);
				break;
			case "rays":
				this.drawRaysPattern(ctx, width, height, themeConfig);
				break;
			default:
				this.drawGradientBackground(ctx, width, height, themeConfig);
		}
	}

	/**
	 * Choose a pattern type appropriate for the theme
	 */
	private getPatternTypeForTheme(theme: ThemeName): string {
		switch (theme) {
			case "futuristic":
				return "tech";
			case "neon":
				return "glow";
			case "minimal":
				return "subtle";
			case "aurora":
				return "flow";
			case "sunset":
				return "rays";
			default:
				return "noise";
		}
	}

	/**
	 * Draw a noise texture gradient background (default theme)
	 */
	private drawNoiseGradient(
		ctx: any,
		width: number,
		height: number,
		themeConfig: any,
	) {
		// Create a rich base gradient with theme colors
		const baseColor = themeConfig.progressBarColor || "#FF3C3C";
		const darkColor = this.adjustColorBrightness(baseColor, -0.7);
		const midColor = this.adjustColorBrightness(baseColor, -0.5);
		const accentColor = this.adjustColorBrightness(baseColor, 0.2);

		// Create a diagonal gradient for more visual interest
		const gradient = ctx.createLinearGradient(0, 0, width, height);
		gradient.addColorStop(0, darkColor);
		gradient.addColorStop(0.4, midColor);
		gradient.addColorStop(
			0.9,
			this.adjustColorBrightness(themeConfig.backgroundColor, -0.1),
		);
		gradient.addColorStop(1, themeConfig.backgroundColor);

		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, width, height);

		// Add a subtle radial highlight in the upper corner
		const radialGradient = ctx.createRadialGradient(
			width * 0.2,
			height * 0.2,
			0,
			width * 0.2,
			height * 0.2,
			width * 0.7,
		);
		radialGradient.addColorStop(0, this.adjustColorAlpha(accentColor, 0.1));
		radialGradient.addColorStop(0.7, "rgba(0,0,0,0)");

		ctx.fillStyle = radialGradient;
		ctx.fillRect(0, 0, width, height);

		// Generate improved noise with varying intensity
		this.drawEnhancedNoise(ctx, width, height, {
			baseColor: baseColor,
			opacity: 0.2,
			scale: 1,
			blend: "screen",
		});

		// Add a second layer of noise with different scale for texture depth
		this.drawEnhancedNoise(ctx, width, height, {
			baseColor: midColor,
			opacity: 0.15,
			scale: 2,
			blend: "overlay",
		});

		// Add a subtle pattern of diagonal lines in accent color
		ctx.strokeStyle = this.adjustColorAlpha(accentColor, 0.1);
		ctx.lineWidth = 1;
		const lineSpacing = 50;

		for (let i = -height; i < width + height; i += lineSpacing) {
			ctx.beginPath();
			ctx.moveTo(i, 0);
			ctx.lineTo(i + height, height);
			ctx.stroke();
		}

		// Add a few subtle accent shapes that match the theme
		ctx.fillStyle = this.adjustColorAlpha(accentColor, 0.05);

		for (let i = 0; i < 5; i++) {
			const size = Math.random() * width * 0.2 + width * 0.05;
			const x = Math.random() * width;
			const y = Math.random() * height;

			// Random shape
			const shapeType = Math.floor(Math.random() * 3);

			if (shapeType === 0) {
				// Circle
				ctx.beginPath();
				ctx.arc(x, y, size / 2, 0, Math.PI * 2);
				ctx.fill();
			} else if (shapeType === 1) {
				// Rectangle with rounded corners
				roundRect(ctx, x - size / 2, y - size / 2, size, size, 10);
				ctx.fill();
			} else {
				// Abstract curved shape
				ctx.beginPath();
				ctx.moveTo(x, y);
				ctx.quadraticCurveTo(x + size / 2, y - size / 2, x + size, y);
				ctx.quadraticCurveTo(x + size / 2, y + size / 2, x, y);
				ctx.fill();
			}
		}

		// Add a subtle vignette effect for depth
		this.drawVignette(ctx, width, height, 0.3);
	}

	/**
	 * Draw enhanced noise with more control over appearance
	 */
	private drawEnhancedNoise(
		ctx: any,
		width: number,
		height: number,
		options: {
			baseColor: string;
			opacity: number;
			scale: number;
			blend: string;
		},
	) {
		// Generate noise data
		const noiseScale = options.scale || 1;
		const density = 0.7;
		const noiseData = this.generateNoiseData(
			Math.ceil(width / noiseScale),
			Math.ceil(height / noiseScale),
			density,
		);

		const noiseImageData = ctx.createImageData(width, height);

		// Parse base color
		let r = 255,
			g = 255,
			b = 255;
		if (options.baseColor) {
			const colorMatch = options.baseColor.match(
				/#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i,
			);
			if (colorMatch) {
				r = parseInt(colorMatch[1], 16);
				g = parseInt(colorMatch[2], 16);
				b = parseInt(colorMatch[3], 16);
			}
		}

		// Apply noise with color tinting and scaling
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const noiseX = Math.floor(x / noiseScale);
				const noiseY = Math.floor(y / noiseScale);
				const noiseIndex = noiseY * Math.ceil(width / noiseScale) + noiseX;
				const noiseValue = noiseData[noiseIndex] || Math.random();

				// Apply fractal noise modification for more natural look
				const adjustedNoise = noiseValue ** 1.5 * options.opacity;

				// Calculate pixel index
				const pixelIndex = (y * width + x) * 4;

				// Apply the noise with color tinting based on blend mode
				if (options.blend === "screen") {
					noiseImageData.data[pixelIndex] = r;
					noiseImageData.data[pixelIndex + 1] = g;
					noiseImageData.data[pixelIndex + 2] = b;
				} else {
					// For overlay blend, use darker color
					noiseImageData.data[pixelIndex] = r * 0.7;
					noiseImageData.data[pixelIndex + 1] = g * 0.7;
					noiseImageData.data[pixelIndex + 2] = b * 0.7;
				}

				// Set alpha based on noise value
				noiseImageData.data[pixelIndex + 3] = adjustedNoise * 255;
			}
		}

		// Alternative: use composite operation for blending
		ctx.globalCompositeOperation = options.blend || "screen";
		ctx.putImageData(noiseImageData, 0, 0);
		ctx.globalCompositeOperation = "source-over"; // Reset
	}

	/**
	 * Draw a tech/circuit pattern (futuristic theme)
	 */
	private drawTechPattern(
		ctx: any,
		width: number,
		height: number,
		themeConfig: any,
	) {
		// Create rich futuristic gradient background
		const bgGradient = ctx.createLinearGradient(0, 0, width, height);
		bgGradient.addColorStop(
			0,
			this.adjustColorBrightness(themeConfig.backgroundColor, 0.15),
		);
		bgGradient.addColorStop(
			0.4,
			this.adjustColorBrightness(themeConfig.backgroundColor, 0.05),
		);
		bgGradient.addColorStop(
			1,
			this.adjustColorBrightness(themeConfig.backgroundColor, -0.1),
		);
		ctx.fillStyle = bgGradient;
		ctx.fillRect(0, 0, width, height);

		// Add a subtle radial highlight
		const radialGradient = ctx.createRadialGradient(
			width * 0.7,
			height * 0.3,
			0,
			width * 0.7,
			height * 0.3,
			width * 0.8,
		);
		radialGradient.addColorStop(
			0,
			this.adjustColorAlpha(themeConfig.progressBarColor, 0.1),
		);
		radialGradient.addColorStop(
			0.5,
			this.adjustColorAlpha(themeConfig.progressBarColor, 0.05),
		);
		radialGradient.addColorStop(1, "rgba(0,0,0,0)");
		ctx.fillStyle = radialGradient;
		ctx.fillRect(0, 0, width, height);

		// Colors
		const accentColor = themeConfig.progressBarColor;
		const lineColor = this.adjustColorAlpha(accentColor, 0.3);
		const nodeColor = accentColor;
		const dimLineColor = this.adjustColorAlpha(accentColor, 0.15);

		// Draw precise grid
		const gridSize = 40;

		// Draw vertical grid lines
		ctx.lineWidth = 0.5;
		ctx.globalAlpha = 0.2;
		ctx.strokeStyle = dimLineColor;

		for (let x = 0; x < width; x += gridSize / 2) {
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, height);
			ctx.stroke();
		}

		// Draw horizontal grid lines
		for (let y = 0; y < height; y += gridSize / 2) {
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(width, y);
			ctx.stroke();
		}

		// Draw accent grid lines (thicker, more prominent)
		ctx.lineWidth = 1;
		ctx.globalAlpha = 0.4;
		ctx.strokeStyle = lineColor;

		for (let x = 0; x < width; x += gridSize * 2) {
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, height);
			ctx.stroke();
		}

		for (let y = 0; y < height; y += gridSize * 2) {
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(width, y);
			ctx.stroke();
		}

		// Create data flow lines with animation simulation
		ctx.globalAlpha = 0.5;
		ctx.lineWidth = 1.5;
		ctx.shadowColor = accentColor;
		ctx.shadowBlur = 5;

		for (let i = 0; i < 8; i++) {
			const startY = 50 + Math.random() * (height - 100);
			const controlY = startY + (Math.random() - 0.5) * 100;
			const endY = startY + (Math.random() - 0.5) * 150;

			// Random line style
			const lineStyle = Math.random() > 0.5 ? "bezier" : "steps";

			// Random line brightness
			const brightness = Math.random() * 0.3 + 0.7;
			ctx.strokeStyle = this.adjustColorBrightness(accentColor, brightness - 1);

			ctx.beginPath();
			ctx.moveTo(0, startY);

			if (lineStyle === "bezier") {
				// Smooth curve
				const cp1x = width * 0.33;
				const cp1y = controlY;
				const cp2x = width * 0.66;
				const cp2y = endY;
				ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, width, endY);
			} else {
				// Step pattern (digital data style)
				const segments = Math.floor(Math.random() * 3) + 4;
				const segWidth = width / segments;

				for (let s = 0; s < segments; s++) {
					const _x1 = s * segWidth;
					const x2 = (s + 1) * segWidth;
					const y = s % 2 === 0 ? startY : endY;

					// Horizontal line
					ctx.lineTo(x2, y);

					// If not last segment, draw vertical line
					if (s < segments - 1) {
						const nextY = s % 2 === 0 ? endY : startY;
						ctx.lineTo(x2, nextY);
					}
				}
			}

			ctx.stroke();

			// Add data packets
			const packetCount = Math.floor(Math.random() * 3) + 3;
			ctx.fillStyle = accentColor;
			ctx.shadowBlur = 10;

			for (let j = 0; j < packetCount; j++) {
				const t = j / packetCount;
				let x: number;
				let y: number;

				if (lineStyle === "bezier") {
					// Calculate position on bezier curve
					const cp1x = width * 0.33;
					const cp1y = controlY;
					const cp2x = width * 0.66;
					const cp2y = endY;

					// Bezier formula
					const mt = 1 - t;
					x =
						mt * mt * mt * 0 +
						3 * mt * mt * t * cp1x +
						3 * mt * t * t * cp2x +
						t * t * t * width;
					y =
						mt * mt * mt * startY +
						3 * mt * mt * t * cp1y +
						3 * mt * t * t * cp2y +
						t * t * t * endY;
				} else {
					// Calculate position on step line
					const segments = Math.floor(Math.random() * 3) + 4;
					const segWidth = width / segments;
					const segment = Math.floor(t * segments);

					const x1 = segment * segWidth;
					const _x2 = (segment + 1) * segWidth;
					const segmentProgress = (t * segments) % 1;

					x = x1 + segmentProgress * segWidth;
					y = segment % 2 === 0 ? startY : endY;
				}

				// Draw glowing data packet
				ctx.beginPath();
				ctx.arc(x, y, 3, 0, Math.PI * 2);
				ctx.fill();

				// Add glow
				ctx.globalAlpha = 0.3;
				ctx.beginPath();
				ctx.arc(x, y, 6, 0, Math.PI * 2);
				ctx.fill();
				ctx.globalAlpha = 0.5;
			}
		}

		// Add circuit nodes at grid intersections
		ctx.shadowBlur = 3;
		ctx.globalAlpha = 0.7;
		ctx.fillStyle = nodeColor;

		for (let x = gridSize; x < width; x += gridSize * 2) {
			for (let y = gridSize; y < height; y += gridSize * 2) {
				if (Math.random() > 0.65) {
					// Randomize node appearance
					const nodeType = Math.floor(Math.random() * 3);

					if (nodeType === 0) {
						// Circle node
						ctx.beginPath();
						ctx.arc(x, y, 3, 0, Math.PI * 2);
						ctx.fill();
					} else if (nodeType === 1) {
						// Square node
						ctx.fillRect(x - 2, y - 2, 4, 4);
					} else {
						// Diamond node
						ctx.beginPath();
						ctx.moveTo(x, y - 3);
						ctx.lineTo(x + 3, y);
						ctx.lineTo(x, y + 3);
						ctx.lineTo(x - 3, y);
						ctx.closePath();
						ctx.fill();
					}
				}
			}
		}

		// Add some larger circuit elements
		ctx.lineWidth = 1;
		ctx.globalAlpha = 0.6;
		ctx.strokeStyle = accentColor;

		for (let i = 0; i < 4; i++) {
			const x = width * 0.1 + Math.random() * width * 0.8;
			const y = height * 0.1 + Math.random() * height * 0.8;
			const size = 20 + Math.random() * 30;

			// Draw a circuit component
			if (Math.random() > 0.5) {
				// Circle component
				ctx.beginPath();
				ctx.arc(x, y, size / 2, 0, Math.PI * 2);
				ctx.stroke();

				// Inner detail
				const innerSize = size * 0.5;
				ctx.beginPath();
				ctx.arc(x, y, innerSize / 2, 0, Math.PI * 2);
				ctx.stroke();

				// Connection lines
				const angles = [0, Math.PI / 2, Math.PI, Math.PI * 1.5];
				for (const a of angles) {
					if (Math.random() > 0.5) {
						const lineLength = 15 + Math.random() * 10;
						const endX = x + Math.cos(a) * (size / 2 + lineLength);
						const endY = y + Math.sin(a) * (size / 2 + lineLength);

						ctx.beginPath();
						ctx.moveTo(
							x + Math.cos(a) * (size / 2),
							y + Math.sin(a) * (size / 2),
						);
						ctx.lineTo(endX, endY);
						ctx.stroke();

						// Node at end
						ctx.beginPath();
						ctx.arc(endX, endY, 2, 0, Math.PI * 2);
						ctx.fill();
					}
				}
			} else {
				// Rectangular component
				ctx.strokeRect(x - size / 2, y - size / 3, size, (size * 2) / 3);

				// Inner detail
				ctx.strokeRect(x - size / 4, y - size / 6, size / 2, size / 3);

				// Connection points
				const points = [
					{ x: x - size / 2, y: y },
					{ x: x + size / 2, y: y },
					{ x: x, y: y - size / 3 },
					{ x: x, y: y + size / 3 },
				];

				for (const p of points) {
					if (Math.random() > 0.3) {
						const angle = Math.atan2(p.y - y, p.x - x);
						const lineLength = 15 + Math.random() * 10;
						const endX = p.x + Math.cos(angle) * lineLength;
						const endY = p.y + Math.sin(angle) * lineLength;

						ctx.beginPath();
						ctx.moveTo(p.x, p.y);
						ctx.lineTo(endX, endY);
						ctx.stroke();

						// Node at end
						ctx.beginPath();
						ctx.arc(endX, endY, 2, 0, Math.PI * 2);
						ctx.fill();
					}
				}
			}
		}

		// Reset
		ctx.globalAlpha = 1;
		ctx.shadowBlur = 0;

		// Add a subtle vignette
		this.drawVignette(ctx, width, height, 0.4);
	}

	/**
	 * Draw a glowing pattern (neon theme)
	 */
	private drawGlowPattern(
		ctx: any,
		width: number,
		height: number,
		themeConfig: any,
	) {
		// Create a dark background with a subtle gradient
		const bgGradient = ctx.createRadialGradient(
			width / 2,
			height / 2,
			0,
			width / 2,
			height / 2,
			Math.max(width, height) / 1.5,
		);
		bgGradient.addColorStop(0, "#0a0a12");
		bgGradient.addColorStop(1, "#000000");
		ctx.fillStyle = bgGradient;
		ctx.fillRect(0, 0, width, height);

		// Add a central glow effect
		const glowGradient = ctx.createRadialGradient(
			width / 2,
			height / 2,
			0,
			width / 2,
			height / 2,
			width / 2,
		);
		glowGradient.addColorStop(
			0,
			this.adjustColorAlpha(themeConfig.progressBarColor, 0.15),
		);
		glowGradient.addColorStop(
			0.7,
			this.adjustColorAlpha(themeConfig.progressBarColor, 0.05),
		);
		glowGradient.addColorStop(1, "rgba(0,0,0,0)");
		ctx.fillStyle = glowGradient;
		ctx.fillRect(0, 0, width, height);

		// Create grid pattern
		const gridSize = 20;
		ctx.strokeStyle = this.adjustColorAlpha(themeConfig.progressBarColor, 0.1);
		ctx.lineWidth = 0.5;

		// Horizontal grid lines
		for (let y = 0; y < height; y += gridSize) {
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(width, y);
			ctx.stroke();
		}

		// Vertical grid lines
		for (let x = 0; x < width; x += gridSize) {
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, height);
			ctx.stroke();
		}

		// Draw neon elements
		const neonColors = [
			themeConfig.progressBarColor, // Primary theme color
			"#00FFFF", // Cyan
			"#FF00FF", // Magenta
			"#FFFF00", // Yellow
		];

		// Apply glow effect
		ctx.shadowBlur = 15;
		ctx.lineWidth = 2;

		// Draw horizontal neon accent lines
		for (let i = 0; i < 5; i++) {
			const y = Math.random() * height;
			const neonColor = neonColors[i % neonColors.length];
			ctx.strokeStyle = neonColor;
			ctx.shadowColor = neonColor;

			// Create a line with varying opacity
			ctx.beginPath();
			ctx.moveTo(0, y);

			// Wavy pattern
			for (let x = 0; x < width; x += 5) {
				const amplitude = Math.sin(x * 0.01) * 5;
				ctx.lineTo(x, y + amplitude);
			}

			ctx.globalAlpha = 0.7;
			ctx.stroke();
		}

		// Draw vertical accent lines
		for (let i = 0; i < 3; i++) {
			const x = 100 + (i * (width - 200)) / 2;
			const neonColor = neonColors[(i + 2) % neonColors.length];
			ctx.strokeStyle = neonColor;
			ctx.shadowColor = neonColor;

			ctx.beginPath();
			ctx.moveTo(x, 0);

			// Wavy pattern
			for (let y = 0; y < height; y += 5) {
				const amplitude = Math.sin(y * 0.02) * 8;
				ctx.lineTo(x + amplitude, y);
			}

			ctx.globalAlpha = 0.6;
			ctx.stroke();
		}

		// Add glowing dots at intersections
		for (let x = gridSize; x < width; x += gridSize * 2) {
			for (let y = gridSize; y < height; y += gridSize * 2) {
				if (Math.random() > 0.85) {
					const dotColor =
						neonColors[Math.floor(Math.random() * neonColors.length)];
					ctx.fillStyle = dotColor;
					ctx.shadowColor = dotColor;
					ctx.shadowBlur = 10;
					ctx.beginPath();
					ctx.arc(x, y, 2, 0, Math.PI * 2);
					ctx.fill();
				}
			}
		}

		// Add larger glowing elements
		for (let i = 0; i < 8; i++) {
			const x = Math.random() * width;
			const y = Math.random() * height;
			const size = Math.random() * 4 + 3;
			const neonColor =
				neonColors[Math.floor(Math.random() * neonColors.length)];

			ctx.fillStyle = neonColor;
			ctx.shadowColor = neonColor;
			ctx.shadowBlur = 20;
			ctx.globalAlpha = 0.8;

			// Draw glow dot
			ctx.beginPath();
			ctx.arc(x, y, size, 0, Math.PI * 2);
			ctx.fill();

			// Add pulsing halo
			ctx.globalAlpha = 0.3;
			ctx.beginPath();
			ctx.arc(x, y, size * 3, 0, Math.PI * 2);
			ctx.fill();
		}

		// Reset shadow and alpha
		ctx.shadowBlur = 0;
		ctx.globalAlpha = 1;
	}

	/**
	 * Draw a subtle pattern (minimal theme)
	 */
	private drawSubtlePattern(
		ctx: any,
		width: number,
		height: number,
		themeConfig: any,
	) {
		// Create a clean light background
		ctx.fillStyle = themeConfig.backgroundColor;
		ctx.fillRect(0, 0, width, height);

		// Add very subtle gradient
		const gradient = ctx.createLinearGradient(0, 0, width, height);
		gradient.addColorStop(
			0,
			this.adjustColorBrightness(themeConfig.backgroundColor, -0.03),
		);
		gradient.addColorStop(
			1,
			this.adjustColorBrightness(themeConfig.backgroundColor, 0.03),
		);

		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, width, height);

		// Add subtle dots pattern
		const dotColor = this.adjustColorAlpha(themeConfig.progressBarColor, 0.1);
		const dotSize = 1;
		const spacing = 15;

		ctx.fillStyle = dotColor;

		for (let x = spacing; x < width; x += spacing) {
			for (let y = spacing; y < height; y += spacing) {
				ctx.beginPath();
				ctx.arc(x, y, dotSize, 0, Math.PI * 2);
				ctx.fill();
			}
		}

		// Add a few thin lines
		ctx.strokeStyle = dotColor;
		ctx.lineWidth = 0.5;

		for (let i = 0; i < 3; i++) {
			const y = Math.floor(height / 4) * (i + 1);

			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(width, y);
			ctx.stroke();
		}
	}

	/**
	 * Draw a flowing aurora pattern (aurora theme)
	 */
	private drawFlowPattern(
		ctx: any,
		width: number,
		height: number,
		themeConfig: any,
	) {
		// Create a deep space background gradient
		const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
		bgGradient.addColorStop(0, "#050510"); // Deep space
		bgGradient.addColorStop(0.9, "#0A0A25"); // Subtle blue-purple
		bgGradient.addColorStop(1, "#0A0A1A"); // Base color
		ctx.fillStyle = bgGradient;
		ctx.fillRect(0, 0, width, height);

		// Draw star field
		this.drawStarField(ctx, width, height);

		// Enhanced aurora waves with multiple blended colors
		const time = Date.now() * 0.001; // Animation time seed
		const auroraColorSchemes = [
			// Purple-blue-green scheme (default)
			[
				{ color: "#7F3FBF", pos: 0.0 }, // Purple
				{ color: "#3F7FBF", pos: 0.3 }, // Blue
				{ color: "#3FBF7F", pos: 0.6 }, // Teal
				{ color: "#7F3FBF", pos: 1.0 }, // Back to purple for seamless looping
			],
			// Green-cyan-blue scheme
			[
				{ color: "#00FF88", pos: 0.0 }, // Green
				{ color: "#00FFCC", pos: 0.3 }, // Cyan
				{ color: "#0088FF", pos: 0.7 }, // Blue
				{ color: "#00FF88", pos: 1.0 }, // Back to green
			],
			// Red-purple-blue scheme
			[
				{ color: "#FF3366", pos: 0.0 }, // Red
				{ color: "#FF33CC", pos: 0.3 }, // Pink
				{ color: "#9933FF", pos: 0.7 }, // Purple
				{ color: "#FF3366", pos: 1.0 }, // Back to red
			],
		];

		// Choose a color scheme based on a property of themeConfig
		const colorSchemeIndex =
			themeConfig.progressBarColor.charCodeAt(1) % auroraColorSchemes.length;
		const colorScheme = auroraColorSchemes[colorSchemeIndex];

		// Draw multiple aurora layers with varying properties
		const layers = 5;

		// Apply shadow for glow effect
		ctx.shadowBlur = 10;
		ctx.shadowColor = themeConfig.progressBarColor;

		for (let layer = 0; layer < layers; layer++) {
			// Calculate layer parameters
			const layerOpacity = 0.15 + (layers - layer) * 0.05; // Back layers more transparent
			const amplitude = 15 + layer * 10; // Increasing amplitude for each layer
			const yPosition = height * 0.3 + layer * 40; // Position from top
			const frequency = 0.008 - layer * 0.001; // Wave frequency
			const speedFactor = 0.2 + layer * 0.05; // Animation speed

			// Create aurora gradient based on the selected color scheme
			const auroraGradient = ctx.createLinearGradient(
				0,
				yPosition - amplitude * 2,
				0,
				yPosition + amplitude * 2,
			);

			// Use colors from the selected scheme with adjustments for each layer
			for (const stop of colorScheme) {
				const color = this.adjustColorBrightness(stop.color, layer * 0.05);
				auroraGradient.addColorStop(
					stop.pos,
					this.adjustColorAlpha(color, layerOpacity),
				);
			}

			ctx.fillStyle = auroraGradient;

			// Draw an aurora wave with Perlin noise
			ctx.beginPath();
			ctx.moveTo(0, height);

			// Use smaller steps for smoother waves
			const step = 3;
			for (let x = 0; x < width; x += step) {
				// Combine sine waves with Perlin noise for organic movement
				const noiseX = x * 0.01;
				const noiseY = layer * 0.2 + time * speedFactor;
				const noise = this.simplexNoise(noiseX, noiseY) * amplitude * 1.5;

				// Create primary wave with sine
				const wave1 = Math.sin(x * frequency + time * 0.5) * amplitude;
				// Add secondary wave for complexity
				const wave2 =
					Math.sin(x * frequency * 2 + time * 0.3) * (amplitude * 0.3);

				// Combine waves and noise
				const y = yPosition + wave1 + wave2 + noise;

				ctx.lineTo(x, y);
			}

			// Complete the path
			ctx.lineTo(width, height);
			ctx.lineTo(0, height);
			ctx.closePath();
			ctx.fill();
		}

		// Reset shadow
		ctx.shadowBlur = 0;

		// Add a subtle overlay gradient at the bottom for depth
		const overlayGradient = ctx.createLinearGradient(
			0,
			height * 0.7,
			0,
			height,
		);
		overlayGradient.addColorStop(0, "rgba(0,0,0,0)");
		overlayGradient.addColorStop(1, "rgba(0,0,10,0.3)");
		ctx.fillStyle = overlayGradient;
		ctx.fillRect(0, 0, width, height);

		// Add a subtle vignette
		this.drawVignette(ctx, width, height, 0.3);
	}

	/**
	 * Draw a star field for night sky backgrounds
	 */
	private drawStarField(ctx: any, width: number, height: number) {
		// Stars with different sizes and brightness
		const starCount = 200;
		const maxHeight = height * 0.85; // Keep stars mostly in the top part

		// Different star types
		for (let i = 0; i < starCount; i++) {
			const x = Math.random() * width;
			const y = Math.random() * maxHeight;
			const size = Math.random();

			// Determine star type
			if (size < 0.6) {
				// Small distant star
				ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.random() * 0.4})`;
				ctx.beginPath();
				ctx.arc(x, y, 0.5, 0, Math.PI * 2);
				ctx.fill();
			} else if (size < 0.9) {
				// Medium star
				ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + Math.random() * 0.5})`;
				ctx.beginPath();
				ctx.arc(x, y, 1, 0, Math.PI * 2);
				ctx.fill();
			} else {
				// Bright star with glow
				const starColor =
					Math.random() > 0.7
						? `rgb(${200 + Math.random() * 55}, ${200 + Math.random() * 55}, 255)`
						: // Bluish star
							`rgb(255, ${200 + Math.random() * 55}, ${200 + Math.random() * 55})`; // Reddish star

				// Draw glow
				ctx.shadowColor = starColor;
				ctx.shadowBlur = 4;
				ctx.fillStyle = starColor;

				// Draw the star
				ctx.beginPath();
				ctx.arc(x, y, 1.5, 0, Math.PI * 2);
				ctx.fill();

				// Reset shadow
				ctx.shadowBlur = 0;
			}
		}

		// Add a few "twinkling" stars
		for (let i = 0; i < 20; i++) {
			const x = Math.random() * width;
			const y = Math.random() * (maxHeight * 0.7);
			const size = 1 + Math.random() * 1.5;

			// Create a pulsing effect
			const pulseScale =
				0.7 + Math.sin(Date.now() * 0.001 * (0.5 + Math.random() * 2)) * 0.3;

			ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
			ctx.shadowColor = "rgba(180, 220, 255, 0.8)";
			ctx.shadowBlur = 5 * pulseScale;

			ctx.beginPath();
			ctx.arc(x, y, size * pulseScale, 0, Math.PI * 2);
			ctx.fill();
		}

		// Reset shadow
		ctx.shadowBlur = 0;
	}

	/**
	 * Draw a rays pattern (sunset theme)
	 */
	private drawRaysPattern(
		ctx: any,
		width: number,
		height: number,
		themeConfig: any,
	) {
		// Create sunset gradient
		const gradient = ctx.createLinearGradient(0, 0, 0, height);

		// Sunset colors from top to bottom
		gradient.addColorStop(0, "#0A0A1A"); // Night sky
		gradient.addColorStop(0.5, "#3D0C02"); // Middle sunset
		gradient.addColorStop(0.7, "#FF8C00"); // Horizon orange
		gradient.addColorStop(0.85, "#FF4500"); // Bottom red
		gradient.addColorStop(1, themeConfig.backgroundColor);

		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, width, height);

		// Draw sun rays
		const centerX = width / 2;
		const centerY = height * 0.75; // Sun position at 3/4 down
		const rayCount = 12;
		const innerRadius = 30;
		const outerRadius = Math.max(width, height);

		// Clip the rays to only show the top part (creating a sunset effect)
		ctx.save();
		ctx.beginPath();
		ctx.rect(0, 0, width, centerY);
		ctx.clip();

		// Draw the rays
		ctx.globalAlpha = 0.2;
		for (let i = 0; i < rayCount; i++) {
			const angle = (i / rayCount) * Math.PI * 2;
			const startX = centerX + Math.cos(angle) * innerRadius;
			const startY = centerY + Math.sin(angle) * innerRadius;
			const endX = centerX + Math.cos(angle) * outerRadius;
			const endY = centerY + Math.sin(angle) * outerRadius;

			// Create ray gradient
			const rayGradient = ctx.createLinearGradient(startX, startY, endX, endY);
			rayGradient.addColorStop(0, "#FFFFFF");
			rayGradient.addColorStop(0.1, this.adjustColorAlpha("#FFCC00", 0.8));
			rayGradient.addColorStop(0.3, this.adjustColorAlpha("#FF8C00", 0.4));
			rayGradient.addColorStop(1, "rgba(0,0,0,0)");

			ctx.fillStyle = rayGradient;

			// Draw ray
			ctx.beginPath();
			ctx.moveTo(startX, startY);

			// Calculate ray width
			const rayWidth = Math.PI / rayCount;
			const angle1 = angle - rayWidth / 2;
			const angle2 = angle + rayWidth / 2;

			ctx.arc(centerX, centerY, innerRadius, angle1, angle2);
			ctx.lineTo(
				centerX + Math.cos(angle2) * outerRadius,
				centerY + Math.sin(angle2) * outerRadius,
			);
			ctx.lineTo(
				centerX + Math.cos(angle1) * outerRadius,
				centerY + Math.sin(angle1) * outerRadius,
			);
			ctx.closePath();
			ctx.fill();
		}

		ctx.restore();

		// Draw the sun
		const sunGradient = ctx.createRadialGradient(
			centerX,
			centerY,
			0,
			centerX,
			centerY,
			innerRadius,
		);
		sunGradient.addColorStop(0, "#FFFFFF");
		sunGradient.addColorStop(0.3, "#FFCC00");
		sunGradient.addColorStop(1, "#FF4500");

		ctx.globalAlpha = 0.9;
		ctx.fillStyle = sunGradient;
		ctx.beginPath();
		ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
		ctx.fill();

		// Add some clouds on the horizon
		ctx.globalAlpha = 0.3;
		for (let i = 0; i < 5; i++) {
			const cloudX = Math.random() * width;
			const cloudY = height * 0.65 + Math.random() * 50;
			const cloudWidth = 50 + Math.random() * 100;
			const cloudHeight = 10 + Math.random() * 20;

			ctx.fillStyle = "#FFCCAA";
			ctx.beginPath();
			this.drawCloud(ctx, cloudX, cloudY, cloudWidth, cloudHeight);
			ctx.fill();
		}

		ctx.globalAlpha = 1;
	}

	/**
	 * Helper method to draw a cloud shape
	 */
	private drawCloud(
		ctx: any,
		x: number,
		y: number,
		width: number,
		height: number,
	) {
		const numBumps = Math.floor(width / 20);

		ctx.moveTo(x, y + height / 2);

		// Bottom curve
		for (let i = 0; i < numBumps; i++) {
			const bumpX = x + (width * i) / numBumps;
			const bumpY =
				y + height / 2 + Math.sin((i * Math.PI) / numBumps) * (height / 2);
			const controlX = bumpX + width / numBumps / 2;
			const controlY = bumpY + (Math.random() * height) / 4;

			ctx.quadraticCurveTo(
				controlX,
				controlY,
				bumpX + width / numBumps,
				y + height / 2,
			);
		}

		// Right side
		ctx.lineTo(x + width, y - height / 2);

		// Top curve
		for (let i = numBumps; i > 0; i--) {
			const bumpX = x + (width * i) / numBumps;
			const bumpY =
				y - height / 2 + Math.sin((i * Math.PI) / numBumps) * (height / 2);
			const controlX = bumpX - width / numBumps / 2;
			const controlY = bumpY - (Math.random() * height) / 4;

			ctx.quadraticCurveTo(
				controlX,
				controlY,
				bumpX - width / numBumps,
				y - height / 2,
			);
		}

		// Left side
		ctx.lineTo(x, y + height / 2);
	}

	/**
	 * Draw a vignette effect
	 */
	private drawVignette(
		ctx: any,
		width: number,
		height: number,
		intensity: number = 0.5,
	) {
		const gradient = ctx.createRadialGradient(
			width / 2,
			height / 2,
			0,
			width / 2,
			height / 2,
			Math.sqrt(width * width + height * height) / 2,
		);

		gradient.addColorStop(0, "rgba(0,0,0,0)");
		gradient.addColorStop(0.5, "rgba(0,0,0,0)");
		gradient.addColorStop(1, `rgba(0,0,0,${intensity})`);

		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, width, height);
	}

	/**
	 * Generate noise data for texture
	 */
	private generateNoiseData(
		width: number,
		height: number,
		density: number = 1,
	): number[] {
		const size = width * height;
		const data = new Array(size);

		for (let i = 0; i < size; i++) {
			data[i] = Math.random() < density ? Math.random() : 0;
		}

		return data;
	}

	/**
	 * Adjust color brightness
	 * @param color Hex color string
	 * @param factor Brightness adjustment (-1 to 1)
	 */
	private adjustColorBrightness(color: string, factor: number): string {
		// Convert hex to RGB
		let r = 0,
			g = 0,
			b = 0;

		if (color.startsWith("#")) {
			const hex = color.substring(1);

			if (hex.length === 3) {
				r = parseInt(hex[0] + hex[0], 16);
				g = parseInt(hex[1] + hex[1], 16);
				b = parseInt(hex[2] + hex[2], 16);
			} else if (hex.length === 6) {
				r = parseInt(hex.substring(0, 2), 16);
				g = parseInt(hex.substring(2, 4), 16);
				b = parseInt(hex.substring(4, 6), 16);
			}
		} else if (color.startsWith("rgba")) {
			const match = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/);
			if (match) {
				r = parseInt(match[1], 10);
				g = parseInt(match[2], 10);
				b = parseInt(match[3], 10);
			}
		} else if (color.startsWith("rgb")) {
			const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
			if (match) {
				r = parseInt(match[1], 10);
				g = parseInt(match[2], 10);
				b = parseInt(match[3], 10);
			}
		}

		// Adjust brightness
		if (factor < 0) {
			factor = 1 + factor; // Convert to a value between 0-1
			r = Math.round(r * factor);
			g = Math.round(g * factor);
			b = Math.round(b * factor);
		} else {
			r = Math.round(r + (255 - r) * factor);
			g = Math.round(g + (255 - g) * factor);
			b = Math.round(b + (255 - b) * factor);
		}

		// Convert back to hex
		return `#${(r < 16 ? "0" : "") + r.toString(16)}${(g < 16 ? "0" : "") + g.toString(16)}${(b < 16 ? "0" : "") + b.toString(16)}`;
	}

	/**
	 * Simple implementation of simplex noise (Perlin noise)
	 * This is a basic approximation for our purposes
	 */
	private simplexNoise(x: number, y: number = 0): number {
		// Convert input coordinates to grid cell coordinates
		const X = Math.floor(x) & 255;
		const Y = Math.floor(y) & 255;

		// Get relative position within grid cell
		x -= Math.floor(x);
		y -= Math.floor(y);

		// Compute fade curves
		const u = this.fade(x);
		const v = this.fade(y);

		// Hash coordinates of the 4 square corners
		const A = this.perm[X] + Y;
		const AA = this.perm[A & 255];
		const AB = this.perm[(A + 1) & 255];
		const B = this.perm[(X + 1) & 255] + Y;
		const BA = this.perm[B & 255];
		const BB = this.perm[(B + 1) & 255];

		// Add blended results from 4 corners of square
		return this.lerp(
			v,
			this.lerp(
				u,
				this.grad(this.perm[AA & 255], x, y),
				this.grad(this.perm[BA & 255], x - 1, y),
			),
			this.lerp(
				u,
				this.grad(this.perm[AB & 255], x, y - 1),
				this.grad(this.perm[BB & 255], x - 1, y - 1),
			),
		);
	}

	private fade(t: number): number {
		return t * t * t * (t * (t * 6 - 15) + 10);
	}

	private lerp(t: number, a: number, b: number): number {
		return a + t * (b - a);
	}

	private grad(hash: number, x: number, y: number): number {
		// Convert low 4 bits of hash code into 12 gradient directions
		const h = hash & 15;
		const u = h < 8 ? x : y;
		const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
		return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
	}

	// Permutation table for simplex noise
	private perm = [
		151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140,
		36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120,
		234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33,
		88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71,
		134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133,
		230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161,
		1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130,
		116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250,
		124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227,
		47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44,
		154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98,
		108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34,
		242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14,
		239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121,
		50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243,
		141, 128, 195, 78, 66, 215, 61, 156, 180,
	];

	/**
	 * Draw a gradient background (fallback)
	 */
	private drawGradientBackground(
		ctx: any,
		width: number,
		height: number,
		themeConfig: any,
	) {
		const gradient = ctx.createLinearGradient(0, 0, width, height);

		// Use theme color with opacity variations
		const baseColor = themeConfig.progressBarColor || "#FF3C3C";
		const darkColor = this.adjustColorBrightness(baseColor, -0.7);

		gradient.addColorStop(0, darkColor);
		gradient.addColorStop(1, themeConfig.backgroundColor);

		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, width, height);
	}

	/**
	 * Adjust color alpha
	 * @param color Color string
	 * @param alpha Alpha value between 0 and 1
	 */
	private adjustColorAlpha(color: string, alpha: number): string {
		let r = 0,
			g = 0,
			b = 0;

		if (color.startsWith("#")) {
			const hex = color.substring(1);

			if (hex.length === 3) {
				r = parseInt(hex[0] + hex[0], 16);
				g = parseInt(hex[1] + hex[1], 16);
				b = parseInt(hex[2] + hex[2], 16);
			} else if (hex.length === 6) {
				r = parseInt(hex.substring(0, 2), 16);
				g = parseInt(hex.substring(2, 4), 16);
				b = parseInt(hex.substring(4, 6), 16);
			}
		} else if (color.startsWith("rgba")) {
			const match = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/);
			if (match) {
				r = parseInt(match[1], 10);
				g = parseInt(match[2], 10);
				b = parseInt(match[3], 10);
			}
		} else if (color.startsWith("rgb")) {
			const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
			if (match) {
				r = parseInt(match[1], 10);
				g = parseInt(match[2], 10);
				b = parseInt(match[3], 10);
			}
		}

		return `rgba(${r}, ${g}, ${b}, ${alpha})`;
	}
}

/**
 * Legacy function for backward compatibility
 */
export async function level(options: LevelOptions): Promise<Buffer> {
	const card = new RankCard(options);
	return card.render();
}

// Helper function to draw rounded rectangles
function roundRect(
	ctx: any,
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
