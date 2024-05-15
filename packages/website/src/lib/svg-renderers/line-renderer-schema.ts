import { z } from 'zod';
import { SvgSetting } from './svg-renderer-schema';

export const pixelPointSchema = z.object({
	x: z.number().int(),
	y: z.number().int(),
	r: z.number().int().min(0).max(255),
	g: z.number().int().min(0).max(255),
	b: z.number().int().min(0).max(255),
	a: z.number().int().min(0).max(255),
});

export type PixelPoint = z.infer<typeof pixelPointSchema>;

export type PixelData = {
	clampedArray: Uint8ClampedArray;
	width: number;
	height: number;
	betweenX: number;
	betweenY: number;
};

export const lineSettingSchema = z.object({
	useRadiusColorIntensity: z.boolean(),
	radius: z.number().int().min(0).max(50),
	radiusRandomness: z.number().min(0).max(1),

	useStroke: z.boolean(),
	useAutoStrokeColor: z.boolean(),
	strokeColor: z.string(),
	strokeWidth: z.number().min(1).max(100),
	strokeWidthRandomness: z.number().min(0).max(1),

	renderEveryXPixels: z.number().min(1).max(100),
	renderEveryYPixels: z.number().min(1).max(100),

	minColorRecognized: z.number().min(0).max(255),
	maxColorRecognized: z.number().min(0).max(255),

	useFill: z.boolean(),
	fillColor: z.string(),

	scale: z.number().min(0).max(3),
});

export type LineSetting = z.infer<typeof lineSettingSchema>;

export class Line {
	constructor(
		public x1: number,
		public y1: number,
		public x2: number,
		public y2: number,
		public strokeColor: string,
		public strokeWidth: number
	) {}
}

export function getPixelColorIntensity(
	pixel: Pick<PixelPoint, 'r' | 'g' | 'b' | 'a'>,
	settings: Pick<SvgSetting, 'minColorRecognized' | 'maxColorRecognized'>
) {
	const { minColorRecognized, maxColorRecognized } = settings;

	const r = pixel.r - minColorRecognized;
	const g = pixel.g - minColorRecognized;
	const b = pixel.b - minColorRecognized;
	const colorSum = Math.max(1, r + g + b);

	const outOf = Math.max(1, Math.abs(maxColorRecognized - minColorRecognized));

	return colorSum / 3 / outOf;
}

export function getPixelColorAtDataIndex(
	imageData: Uint8ClampedArray,
	dataIndex: number
) {
	return {
		r: imageData[dataIndex],
		g: imageData[dataIndex + 1],
		b: imageData[dataIndex + 2],
		a: imageData[dataIndex + 3] / 255,
	};
}
