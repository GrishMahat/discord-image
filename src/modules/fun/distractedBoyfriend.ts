/** @format */
import { createCanvas, loadImage, registerFont } from "canvas";
import { join } from "path";
import { wrapText } from "../../utils/utils";

// Register fonts
try {
    registerFont(join(__dirname, "../../assets/fonts/Noto-Regular.ttf"), {
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
    options: DistractedBoyfriendOptions = {}
): Promise<Buffer> {
    if (!girlfriend?.trim() || !boyfriend?.trim() || !newGirl?.trim()) {
        throw new Error("All three text arguments are required");
    }

    const settings = { ...DEFAULT_OPTIONS, ...options };

    try {
        // Load template and setup canvas
        const base = await loadImage(join(__dirname, "../../assets/distracted-boyfriend.jpg"));
        const canvas = createCanvas(base.width, base.height);
        const ctx = canvas.getContext("2d");


        // Draw template
        ctx.drawImage(base, 0, 0, base.width, base.height);

        // Configure text
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `${settings.bold ? "bold" : ""} ${settings.fontSize}px Noto`.trim();
        ctx.fillStyle = settings.textColor;
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 3;

        // Text positions - adjusted for better positioning
        const positions = [
            { text: girlfriend, x: 700, y: 215, maxWidth: 220 },  // Girlfriend (left)
            { text: boyfriend, x: 440, y: 300, maxWidth: 200 },   // Boyfriend (middle)
            { text: newGirl, x: 210, y: 175, maxWidth: 200 }      // New girl (right)
        ];

        // Draw each text label
        for (const position of positions) {
            const lines = await wrapText(ctx, position.text, position.maxWidth);
            if (!lines) continue;

            const lineHeight = settings.fontSize * 1.2;
            const totalHeight = lines.length * lineHeight;
            let startY = position.y - totalHeight / 2;

            lines.forEach((line, i) => {
                const y = startY + i * lineHeight;
                // Draw text with outline for better readability
                ctx.strokeText(line, position.x, y);
                ctx.fillText(line, position.x, y);
            });
        }

        return canvas.toBuffer("image/png");
    } catch (error) {
        throw new Error(`Failed to create meme: ${error}`);
    }
} 