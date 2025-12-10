/** @format */

import { createCanvas } from "./canvas-compat";

/**
 * Class for generating a solid color image.
 */
export default class Color {
	/**
	 * Creates a new image filled with the specified color.
	 *
	 * @param color - A valid CSS color (e.g. "#FFFFFF", "rgb(255,255,255)") to fill the image with. Defaults to white.
	 * @param width - The width of the image in pixels. Defaults to 480.
	 * @param height - The height of the image in pixels. Defaults to 480.
	 * @returns A Promise resolving with a Buffer containing the generated PNG image.
	 */
	async getImage(
		color: string = "#FFFFFF",
		width: number = 480,
		height: number = 480,
	): Promise<Buffer> {
		try {
			const canvas = createCanvas(width, height);
			const ctx = canvas.getContext("2d");

			ctx.fillStyle = color;
			ctx.fillRect(0, 0, width, height);

			return canvas.toBuffer("image/png");
		} catch (error) {
			throw new Error(`Failed to generate image: ${error}`);
		}
	}
}
