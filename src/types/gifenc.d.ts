declare module "gifenc" {
	export type GifPalette = Array<[number, number, number]>;

	export interface GifWriteFrameOptions {
		palette: GifPalette;
		delay?: number;
		repeat?: number;
		transparent?: boolean;
		transparentIndex?: number;
	}

	export interface GifStream {
		writeFrame(
			index: Uint8Array,
			width: number,
			height: number,
			options: GifWriteFrameOptions,
		): void;
		finish(): void;
		bytes(): Uint8Array;
	}

	export function GIFEncoder(options?: { auto?: boolean }): GifStream;
	export function quantize(
		rgba: Uint8Array | Uint8ClampedArray,
		maxColors: number,
		options?: { format?: "rgb565" | "rgb444" | "rgba4444" },
	): GifPalette;
	export function applyPalette(
		rgba: Uint8Array | Uint8ClampedArray,
		palette: GifPalette,
		format?: "rgb565" | "rgb444" | "rgba4444",
	): Uint8Array;
}
