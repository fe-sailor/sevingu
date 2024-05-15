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
	scale: z.number().min(0).max(3),

	minColorRecognized: z.number().min(0).max(255),
	maxColorRecognized: z.number().min(0).max(255),

	useStroke: z.boolean(),
	useAutoStrokeColor: z.boolean(),
	strokeWidth: z.number().min(1).max(100),
	strokeWidthRandomness: z.number().min(0).max(1),
	useAutoColor: z.boolean(),
	strokeColor: z.string(),

	useContinuous: z.boolean(),
	minlineLength: z.number().min(0).max(300),
	useCrossHatch: z.boolean(),
	amountOfLines: z.number().int().min(1).max(5000),

	renderEveryXPixels: z.number().min(1).max(100),
	renderEveryYPixels: z.number().min(1).max(100),
	lineLength: z.number().min(0).max(300),
	useLengthOnColor: z.boolean(),
	lengthRandomness: z.number().min(0).max(1),

	direction: z.number().int().min(0).max(360),
	directionRandomness: z.number().min(0).max(1),
});

export type LineSetting = z.infer<typeof lineSettingSchema>;

export class Line {
	constructor(
		public x1: number,
		public y1: number,
		public x2: number,
		public y2: number,
		public direction: number,
		public strokeColor: string,
		public strokeWidth: number
	) {}
}
