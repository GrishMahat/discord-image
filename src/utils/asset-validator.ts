/** @format */

import { existsSync, statSync } from "node:fs";
import { extname } from "node:path";
import { getAssetPath } from "./paths";

/**
 * Asset manifest - all template files that must exist
 */
const REQUIRED_ASSETS = [
	// Meme templates
	{ file: "drake.jpeg", minBytes: 10000 },
	{ file: "wanted.png", minBytes: 5000 },
	{ file: "stonk.png", minBytes: 10000 },
	{ file: "notStonk.png", minBytes: 10000 },
	{ file: "doubleStonk.png", minBytes: 10000 },
	{ file: "confusedStonk.png", minBytes: 10000 },
	{ file: "triggered.png", minBytes: 1000 },
	{ file: "jail.png", minBytes: 1000 },
	{ file: "lisa-presentation.png", minBytes: 10000 },
	{ file: "distracted-boyfriend.jpg", minBytes: 10000 },
	{ file: "affect.png", minBytes: 5000 },
	{ file: "ad.png", minBytes: 5000 },
	{ file: "beautiful.png", minBytes: 5000 },
	{ file: "bed.png", minBytes: 5000 },
	{ file: "bobross.png", minBytes: 10000 },
	{ file: "clown.png", minBytes: 5000 },
	{ file: "delete.png", minBytes: 5000 },
	{ file: "facepalm.png", minBytes: 5000 },
	{ file: "heartbreaking.png", minBytes: 5000 },
	{ file: "hitler.png", minBytes: 5000 },
	{ file: "kiss.png", minBytes: 5000 },
	{ file: "rip.png", minBytes: 5000 },
	{ file: "snyder.png", minBytes: 5000 },
	{ file: "spank.png", minBytes: 5000 },
	{ file: "tatoo.png", minBytes: 5000 },
	{ file: "trash.png", minBytes: 5000 },
	{ file: "batslap.png", minBytes: 5000 },
	{ file: "gay.png", minBytes: 1000 },
	// Fonts
	{ file: "fonts/Noto-Regular.ttf", minBytes: 10000 },
] as const;

/**
 * Valid image extensions for templates
 */
const VALID_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".gif"]);
const VALID_FONT_EXTENSIONS = new Set([".ttf", ".otf", ".woff", ".woff2"]);

interface AssetValidationError {
	file: string;
	error: string;
}

interface AssetValidationResult {
	valid: boolean;
	errors: AssetValidationError[];
	validated: number;
}

/**
 * Validates all required assets exist and meet minimum size requirements
 * Call this at startup to fail fast if assets are missing
 */
export function validateAssets(): AssetValidationResult {
	const errors: AssetValidationError[] = [];

	for (const asset of REQUIRED_ASSETS) {
		const assetPath = getAssetPath(asset.file);
		const ext = extname(asset.file).toLowerCase();

		// Check file exists
		if (!existsSync(assetPath)) {
			errors.push({
				file: asset.file,
				error: `Missing asset: ${assetPath}`,
			});
			continue;
		}

		// Check extension is valid
		const isFont = asset.file.includes("fonts/");
		const validExtensions = isFont ? VALID_FONT_EXTENSIONS : VALID_EXTENSIONS;
		if (!validExtensions.has(ext)) {
			errors.push({
				file: asset.file,
				error: `Invalid extension ${ext}. Expected: ${[...validExtensions].join(", ")}`,
			});
			continue;
		}

		// Check file size
		try {
			const stats = statSync(assetPath);
			if (stats.size < asset.minBytes) {
				errors.push({
					file: asset.file,
					error: `File too small: ${stats.size} bytes (min: ${asset.minBytes})`,
				});
			}
		} catch {
			errors.push({
				file: asset.file,
				error: `Cannot read file stats`,
			});
		}
	}

	return {
		valid: errors.length === 0,
		errors,
		validated: REQUIRED_ASSETS.length,
	};
}

/**
 * Validates assets and throws if any are missing/invalid
 * Use this for fail-fast behavior at startup
 */
export function assertAssets(): void {
	const result = validateAssets();
	if (!result.valid) {
		const errorList = result.errors
			.map((e) => `  - ${e.file}: ${e.error}`)
			.join("\n");
		throw new Error(
			`Asset validation failed:\n${errorList}\n\nValidated ${result.validated} assets, ${result.errors.length} errors.`,
		);
	}
}

/**
 * Get list of all registered assets
 */
export function getRegisteredAssets(): string[] {
	return REQUIRED_ASSETS.map((a) => a.file);
}
