import { createCanvas, loadImage, registerFont } from "canvas";
import { validateURL } from "../../utils/utils";
import { ImageInput } from "../../types";

// Interface for welcome card options
export interface WelcomeCardOptions {
  username: string;
  avatar: ImageInput;
  servername?: string;
  memberCount?: number;
  background?: ImageInput;
  theme?: WelcomeTheme;
  message?: string;
  customization?: {
    textColor?: string;
    borderColor?: string;
    backgroundColor?: string;
    avatarBorderColor?: string;
    font?: string;
    fontSize?: number;
  }
}

// Theme definitions
export type WelcomeTheme = 'default' | 'dark' | 'light' | 'colorful' | 'minimal' | 'tech';

// Theme configurations
const THEMES = {
  default: {
    backgroundColor: "rgba(23, 23, 23, 0.8)",
    textColor: "#FFFFFF",
    borderColor: "#3498db",
    avatarBorderColor: "#3498db",
    font: "sans-serif",
    fontSize: 28
  },
  dark: {
    backgroundColor: "rgba(10, 10, 10, 0.9)",
    textColor: "#E0E0E0",
    borderColor: "#7289DA",
    avatarBorderColor: "#7289DA",
    font: "sans-serif",
    fontSize: 28
  },
  light: {
    backgroundColor: "rgba(240, 240, 240, 0.8)",
    textColor: "#333333",
    borderColor: "#7289DA",
    avatarBorderColor: "#7289DA",
    font: "sans-serif",
    fontSize: 28
  },
  colorful: {
    backgroundColor: "rgba(41, 128, 185, 0.7)",
    textColor: "#FFFFFF",
    borderColor: "#FF9800",
    avatarBorderColor: "#FF9800",
    font: "sans-serif",
    fontSize: 28
  },
  minimal: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    textColor: "#333333",
    borderColor: "#DDDDDD",
    avatarBorderColor: "#DDDDDD",
    font: "sans-serif",
    fontSize: 28
  },
  tech: {
    backgroundColor: "rgba(8, 16, 32, 0.85)",
    textColor: "#00FFFF",
    borderColor: "#00AAFF",
    avatarBorderColor: "#00FFFF",
    font: "monospace",
    fontSize: 26
  }
};

/**
 * Creates a welcome card for server greetings
 * @param options The options for the welcome card
 * @returns Promise<Buffer> - The generated welcome card image
 */
export const welcomeCard = async (options: WelcomeCardOptions): Promise<Buffer> => {
  if (!options || !options.username || !options.avatar) {
    throw new Error("You must provide a username and avatar.");
  }

  // Validate avatar URL
  const isValid = await validateURL(options.avatar);
  if (!isValid) {
    throw new Error("You must provide a valid avatar URL or buffer.");
  }

  // Set default theme if not provided
  const theme = options.theme || "default";
  const themeConfig = { ...THEMES[theme] };

  // Apply custom styles if provided
  if (options.customization) {
    if (options.customization.backgroundColor) themeConfig.backgroundColor = options.customization.backgroundColor;
    if (options.customization.textColor) themeConfig.textColor = options.customization.textColor;
    if (options.customization.borderColor) themeConfig.borderColor = options.customization.borderColor;
    if (options.customization.avatarBorderColor) themeConfig.avatarBorderColor = options.customization.avatarBorderColor;
    if (options.customization.font) themeConfig.font = options.customization.font;
    if (options.customization.fontSize) themeConfig.fontSize = options.customization.fontSize;
  }

  // Set default message if not provided
  let message = options.message || "Welcome to the server!";
  if (options.servername && !options.message) {
    message = `Welcome to ${options.servername}!`;
  }

  try {
    // Create canvas
    const canvas = createCanvas(800, 300);
    const ctx = canvas.getContext("2d");

    // Draw background
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // If custom background is provided, draw it
    if (options.background) {
      try {
        const backgroundImage = await loadImage(options.background);
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

        // Add overlay to ensure text readability
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } catch (error) {
        console.error("Failed to load background image, using default background");
      }
    }

    // Draw card background
    ctx.fillStyle = themeConfig.backgroundColor;
    ctx.fillRect(25, 25, canvas.width - 50, canvas.height - 50);

    // Draw border
    ctx.strokeStyle = themeConfig.borderColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(25, 25, canvas.width - 50, canvas.height - 50);

    // Load and draw avatar with glow effect
    const avatar = await loadImage(options.avatar);
    const avatarSize = 120;
    const avatarX = 90;
    const avatarY = canvas.height / 2;

    // Draw avatar glow
    ctx.save();
    ctx.shadowColor = themeConfig.avatarBorderColor;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, avatarX - avatarSize / 2, avatarY - avatarSize / 2, avatarSize, avatarSize);
    ctx.restore();

    // Draw avatar border
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarSize / 2 + 3, 0, Math.PI * 2);
    ctx.strokeStyle = themeConfig.avatarBorderColor;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.closePath();

    // Set text style
    ctx.textAlign = "left";
    ctx.fillStyle = themeConfig.textColor;
    ctx.font = `bold ${themeConfig.fontSize}px ${themeConfig.font}`;

    // Draw username
    ctx.fillText(options.username, 220, 130);

    // Draw welcome message
    ctx.font = `${themeConfig.fontSize - 4}px ${themeConfig.font}`;
    ctx.fillText(message, 220, 170);

    // If member count is provided, draw it
    if (options.memberCount) {
      ctx.font = `${themeConfig.fontSize - 8}px ${themeConfig.font}`;
      ctx.fillText(`You are member #${options.memberCount}`, 220, 210);
    }

    // Draw tech-themed elements for tech theme
    if (theme === "tech") {
      drawTechElements(ctx, canvas.width, canvas.height, themeConfig.borderColor);
    }

    // Return the processed image
    return canvas.toBuffer();
  } catch (error) {
    throw new Error(`Failed to create welcome card: ${error}`);
  }
};

/**
 * Draws tech-themed decorative elements for the tech theme
 */
function drawTechElements(ctx: any, width: number, height: number, color: string) {
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
      customization: this.customization
    });
  }
}
