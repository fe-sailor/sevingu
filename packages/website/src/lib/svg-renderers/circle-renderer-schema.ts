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

export const circleSettingSchema = z.object({
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

export type CircleSetting = z.infer<typeof circleSettingSchema>;

export class Circle {
	constructor(
		public x: number,
		public y: number,
		public r: number,
		public strokeColor: string,
		public strokeWidth: number
	) {}
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
