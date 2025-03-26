/** @format */

import { Jimp } from "jimp";
import { validateURL } from "../../utils/utils";
import { ImageInput } from "../../types";

/**
 * Applies a digital glitch effect to an image
 * @param image - The image URL or buffer to apply the glitch effect to
 * @param intensity - The intensity of the glitch effect (1-10)
 * @returns Promise<Buffer> - The generated glitched image
 */
export const glitch = async (
    image: ImageInput,
    intensity: number = 5
): Promise<Buffer> => {
    if (!image) {
        throw new Error("You must provide an image as the first argument.");
    }

    const isValid = await validateURL(image);
    if (!isValid) {
        throw new Error("You must provide a valid image URL or buffer.");
    }

    if (intensity < 1 || intensity > 10) {
        throw new Error("Intensity must be between 1 and 10.");
    }

    try {
        const jimpImage = await Jimp.read(image);

        // Scale intensity to practical values
        const rgbOffset = Math.floor((intensity / 10) * 15);
        const corruptionChance = intensity / 20;
        const scanlineCount = Math.floor((intensity / 10) * 10) + 1;

        // Create RGB channel offset effect (chromatic aberration)
        const width = jimpImage.bitmap.width;
        const height = jimpImage.bitmap.height;

        // Create copies for RGB channels
        const redChannel = jimpImage.clone();
        const blueChannel = jimpImage.clone();

        // Offset red channel to the left, blue to the right
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // Red channel offset
                if (x + rgbOffset < width) {
                    const redPixel = redChannel.getPixelColor(x + rgbOffset, y);
                    const originalPixel = jimpImage.getPixelColor(x, y);

                    // Extract color components
                    const redRgba = {
                        r: (redPixel >> 24) & 0xFF,
                        g: (redPixel >> 16) & 0xFF,
                        b: (redPixel >> 8) & 0xFF,
                        a: redPixel & 0xFF
                    };

                    const origRgba = {
                        r: (originalPixel >> 24) & 0xFF,
                        g: (originalPixel >> 16) & 0xFF,
                        b: (originalPixel >> 8) & 0xFF,
                        a: originalPixel & 0xFF
                    };

                    // Create new color with red channel from offset
                    const newColor =
                        (redRgba.r << 24) +
                        (origRgba.g << 16) +
                        (origRgba.b << 8) +
                        origRgba.a;

                    jimpImage.setPixelColor(newColor, x, y);
                }

                // Blue channel offset
                if (x - rgbOffset >= 0) {
                    const bluePixel = blueChannel.getPixelColor(x - rgbOffset, y);
                    const currentPixel = jimpImage.getPixelColor(x, y);

                    // Extract color components
                    const blueRgba = {
                        r: (bluePixel >> 24) & 0xFF,
                        g: (bluePixel >> 16) & 0xFF,
                        b: (bluePixel >> 8) & 0xFF,
                        a: bluePixel & 0xFF
                    };

                    const currRgba = {
                        r: (currentPixel >> 24) & 0xFF,
                        g: (currentPixel >> 16) & 0xFF,
                        b: (currentPixel >> 8) & 0xFF,
                        a: currentPixel & 0xFF
                    };

                    // Create new color with blue channel from offset
                    const newColor =
                        (currRgba.r << 24) +
                        (currRgba.g << 16) +
                        (blueRgba.b << 8) +
                        currRgba.a;

                    jimpImage.setPixelColor(newColor, x, y);
                }
            }
        }

        // Add random horizontal corruption lines
        for (let i = 0; i < height * corruptionChance; i++) {
            const y = Math.floor(Math.random() * height);
            const corruptionLength = Math.floor(Math.random() * (width * 0.3)) + 5;
            const startX = Math.floor(Math.random() * (width - corruptionLength));

            // Displace pixels horizontally
            const displacement = Math.floor(Math.random() * 20) - 10;

            for (let x = startX; x < startX + corruptionLength; x++) {
                if (x + displacement >= 0 && x + displacement < width) {
                    const srcY = Math.min(y, height - 1);
                    const destY = Math.min(y, height - 1);
                    const pixelColor = jimpImage.getPixelColor(x + displacement, srcY);
                    jimpImage.setPixelColor(pixelColor, x, destY);
                }
            }
        }

        // Add scanlines
        for (let i = 0; i < scanlineCount; i++) {
            const y = Math.floor(Math.random() * height);
            for (let x = 0; x < width; x++) {
                const pixel = jimpImage.getPixelColor(x, y);

                // Extract color components
                const r = (pixel >> 24) & 0xFF;
                const g = (pixel >> 16) & 0xFF;
                const b = (pixel >> 8) & 0xFF;
                const a = pixel & 0xFF;

                // Brighten scanline
                const boost = 40;
                const newColor =
                    (Math.min(r + boost, 255) << 24) +
                    (Math.min(g + boost, 255) << 16) +
                    (Math.min(b + boost, 255) << 8) +
                    a;

                jimpImage.setPixelColor(newColor, x, y);
            }
        }

        const buffer = await jimpImage.getBuffer("image/png");
        return buffer;
    } catch (error) {
        throw new Error(`Failed to process image: ${error}`);
    }
}; 