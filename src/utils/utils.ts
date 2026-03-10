/** @format */

import { readFileSync, statSync } from "node:fs";
import { get as httpGet } from "node:http";
import { get as httpsGet } from "node:https";
import type { ImageInput } from "../types";
import type { NodeCanvasRenderingContext2D } from "./canvas-compat";
import {
	ErrorHandler,
	NetworkError,
	RetryHandler,
	TimeoutError,
	ValidationError,
} from "./errors";

const MAX_IMAGE_SIZE = 50 * 1024 * 1024; // 50MB
const DATA_URL_PREFIX = "data:image/";

export async function validateURL(
	url: ImageInput,
	timeout: number = 30000,
): Promise<Buffer | null> {
	return ErrorHandler.withErrorHandling(
		async () => {
			if (!url) {
				throw new ValidationError("URL or buffer is required", "url", url);
			}

			if (Buffer.isBuffer(url)) {
				if (url.length === 0) {
					throw new ValidationError(
						"Buffer cannot be empty",
						"url",
						"empty buffer",
					);
				}
				if (url.length > MAX_IMAGE_SIZE) {
					throw new ValidationError(
						`Image too large (> ${MAX_IMAGE_SIZE / 1024 / 1024}MB)`,
						"fileSize",
						url.length,
					);
				}
				return url;
			}

			ErrorHandler.validateRequired(url, "url", "string");
			const input = url.trim();

			if (input.startsWith(DATA_URL_PREFIX)) {
				return decodeImageDataUrl(input);
			}

			if (input.startsWith("https://") || input.startsWith("http://")) {
				if (input.startsWith("http://")) {
					ErrorHandler.log(
						new ValidationError(
							"HTTP URLs are deprecated, please use HTTPS",
							"url",
							input,
						),
						"warn",
					);
				}

				return await RetryHandler.withRetry(
					() => fetchUrlWithTimeout(input, timeout),
					{
						maxAttempts: 3,
						baseDelay: 1000,
						context: `fetchImage(${input})`,
						retryCondition: (error) =>
							error instanceof NetworkError && error.statusCode >= 500,
					},
				);
			}

			return readLocalImageFile(input);
		},
		"validateURL",
		null,
	);
}

function decodeImageDataUrl(dataUrl: string): Buffer {
	const commaIndex = dataUrl.indexOf(",");
	if (commaIndex === -1) {
		throw new ValidationError(
			"Invalid data URL format",
			"url",
			"missing comma",
		);
	}

	const meta = dataUrl.slice(0, commaIndex).toLowerCase();
	const payload = dataUrl.slice(commaIndex + 1);
	const isBase64 = meta.includes(";base64");
	const decoded = isBase64
		? Buffer.from(payload, "base64")
		: Buffer.from(decodeURIComponent(payload), "utf8");

	if (decoded.length === 0) {
		throw new ValidationError(
			"Data URL contains empty image data",
			"url",
			"empty",
		);
	}

	if (decoded.length > MAX_IMAGE_SIZE) {
		throw new ValidationError(
			`Image too large (> ${MAX_IMAGE_SIZE / 1024 / 1024}MB)`,
			"fileSize",
			decoded.length,
		);
	}

	return decoded;
}

function readLocalImageFile(filePath: string): Buffer {
	try {
		const stats = statSync(filePath);
		if (!stats.isFile()) {
			throw new ValidationError("Path is not a file", "url", filePath);
		}

		if (stats.size <= 0) {
			throw new ValidationError("File is empty", "url", filePath);
		}

		if (stats.size > MAX_IMAGE_SIZE) {
			throw new ValidationError(
				`Image too large (> ${MAX_IMAGE_SIZE / 1024 / 1024}MB)`,
				"fileSize",
				stats.size,
			);
		}

		return readFileSync(filePath);
	} catch (error) {
		if (error instanceof ValidationError) {
			throw error;
		}

		if (error instanceof Error) {
			throw new ValidationError(
				"Input must be an image URL, data URL, buffer, or readable local file path",
				"url",
				`${filePath} (${error.message})`,
			);
		}

		throw error;
	}
}

/**
 * Fetch URL with timeout and enhanced error handling
 */
async function fetchUrlWithTimeout(
	url: string,
	timeout: number,
): Promise<Buffer> {
	return new Promise<Buffer>((resolve, reject) => {
		const timeoutId = setTimeout(() => {
			reject(
				new TimeoutError(
					`Request timeout after ${timeout}ms`,
					timeout,
					"fetchUrl",
				),
			);
		}, timeout);

		const fetchWithRedirects = (currentUrl: string, redirectCount = 0) => {
			if (redirectCount > 10) {
				clearTimeout(timeoutId);
				reject(new NetworkError("Too many redirects (>10)", currentUrl, 310));
				return;
			}

			const getter = currentUrl.startsWith("http://") ? httpGet : httpsGet;
			const req = getter(currentUrl, (response) => {
				const statusCode = response.statusCode || 0;

				if (statusCode >= 300 && statusCode < 400) {
					const location = response.headers.location;
					if (!location) {
						clearTimeout(timeoutId);
						reject(
							new NetworkError(
								"Redirect response without location header",
								currentUrl,
								statusCode,
							),
						);
						return;
					}

					const redirectUrl = location.startsWith("http")
						? location
						: new URL(location, currentUrl).toString();

					ErrorHandler.log(
						new NetworkError(
							`Following redirect ${redirectCount + 1}/10 (${statusCode}) to: ${redirectUrl}`,
							currentUrl,
							statusCode,
						),
						"info",
					);

					fetchWithRedirects(redirectUrl, redirectCount + 1);
					return;
				}

				if (statusCode < 200 || statusCode >= 300) {
					clearTimeout(timeoutId);

					if (currentUrl.includes("cdn.discordapp.com") && statusCode === 404) {
						ErrorHandler.log(
							new NetworkError(
								`Discord CDN URL not found: ${currentUrl}`,
								currentUrl,
								statusCode,
							),
							"warn",
						);
						resolve(Buffer.from([]));
						return;
					}

					reject(
						new NetworkError(
							`HTTP ${statusCode} error`,
							currentUrl,
							statusCode,
						),
					);
					return;
				}

				const contentType = response.headers["content-type"];
				if (contentType && !isImageContentType(contentType)) {
					clearTimeout(timeoutId);

					if (currentUrl.includes("cdn.discordapp.com")) {
						ErrorHandler.log(
							new ValidationError(
								`Discord CDN returned non-image content: ${contentType}`,
								"contentType",
								contentType,
							),
							"warn",
						);
						resolve(Buffer.from([]));
						return;
					}

					reject(
						new ValidationError(
							`Invalid content type. Expected image/*, got: ${contentType}`,
							"contentType",
							contentType,
						),
					);
					return;
				}

				const chunks: Buffer[] = [];
				let totalSize = 0;

				response.on("data", (chunk: Buffer | Uint8Array) => {
					const data = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
					totalSize += data.length;
					if (totalSize > MAX_IMAGE_SIZE) {
						clearTimeout(timeoutId);
						req.destroy();
						reject(
							new ValidationError(
								`Image too large (> ${MAX_IMAGE_SIZE / 1024 / 1024}MB)`,
								"fileSize",
								totalSize,
							),
						);
						return;
					}
					chunks.push(data);
				});

				response.on("end", () => {
					clearTimeout(timeoutId);
					const buffer = Buffer.concat(chunks);

					if (buffer.length === 0) {
						reject(
							new ValidationError("Received empty response", "responseSize", 0),
						);
						return;
					}

					resolve(buffer);
				});

				response.on("error", (error) => {
					clearTimeout(timeoutId);
					reject(
						new NetworkError(`Response error: ${error.message}`, currentUrl),
					);
				});
			});

			req.on("error", (error) => {
				clearTimeout(timeoutId);

				if (currentUrl.includes("cdn.discordapp.com")) {
					ErrorHandler.log(
						new NetworkError(
							`Discord CDN request error: ${error.message}`,
							currentUrl,
						),
						"warn",
					);
					resolve(Buffer.from([]));
					return;
				}

				reject(new NetworkError(`Request error: ${error.message}`, currentUrl));
			});

			req.setTimeout(timeout, () => {
				req.destroy();
				reject(
					new TimeoutError(
						`Request timeout after ${timeout}ms`,
						timeout,
						"httpRequest",
					),
				);
			});
		};

		fetchWithRedirects(url);
	});
}

/**
 * Check if content type is a valid image type
 */
function isImageContentType(contentType: string): boolean {
	const imageTypes = [
		"image/jpeg",
		"image/jpg",
		"image/png",
		"image/gif",
		"image/webp",
		"image/bmp",
		"image/tiff",
		"image/svg+xml",
	];

	const cleanType = contentType.split(";")[0].trim().toLowerCase();
	return imageTypes.includes(cleanType);
}

/**
 * Create a responsive text size
 * Code from https://discordjs.guide/popular-topics/canvas.html#adding-in-text
 * @param canvas The canvas object
 * @param text The text to size
 * @param defaultFontSize The starting font size
 * @param width The maximum width
 * @param font The font family
 */
export function applyText(
	canvas: {
		getContext: (
			contextId: string,
			options?: unknown,
		) => CanvasRenderingContext2D;
	},
	text: string,
	defaultFontSize: number,
	width: number,
	font: string,
): string {
	const ctx = canvas.getContext("2d");
	let fontSize = Math.max(1, defaultFontSize);
	do {
		ctx.font = `${fontSize--}px ${font}`;
	} while (fontSize > 1 && ctx.measureText(text).width > width);
	return ctx.font;
}

/**
 * Wrap text to fit within a maximum width
 * @param ctx The canvas rendering context
 * @param text The text to wrap
 * @param maxWidth The maximum width allowed
 */
export function wrapText(
	ctx: NodeCanvasRenderingContext2D,
	text: string,
	maxWidth: number,
): string[] | null {
	if (ctx.measureText(text).width < maxWidth) return [text];
	if (ctx.measureText("W").width > maxWidth) return null;

	const words = text.split(" ").filter(Boolean);
	if (words.length === 0) return [text];

	const lines: string[] = [];
	let line = "";

	while (words.length > 0) {
		let split = false;

		while (ctx.measureText(words[0]).width >= maxWidth) {
			const temp = words[0];
			words[0] = temp.slice(0, -1);
			if (split) {
				words[1] = `${temp.slice(-1)}${words[1]}`;
			} else {
				split = true;
				words.splice(1, 0, temp.slice(-1));
			}
		}

		if (ctx.measureText(`${line}${words[0]}`).width < maxWidth) {
			line += `${words.shift()} `;
		} else {
			lines.push(line.trim());
			line = "";
		}

		if (words.length === 0) {
			lines.push(line.trim());
		}
	}

	return lines;
}
