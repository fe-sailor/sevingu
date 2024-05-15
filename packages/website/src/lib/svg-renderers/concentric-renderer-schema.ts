import { z } from 'zod';

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

export const concentricSettingSchema = z.object({
	scale: z.number().int().min(0).max(3),

	strokeWidth: z.number().min(1).max(100),
	strokeWidthRandomness: z.number().min(0).max(1),
	strokeColor: z.string(),

	circleArcs: z.number().int().min(2).max(400),
	intensityWeight: z.number().int().min(500).max(1000000),
	radiusStep: z.number().int().min(1).max(100),
});

export type ConcentricSetting = z.infer<typeof concentricSettingSchema>;

export class Concentric {
	constructor(
		public x1: number,
		public y1: number,
		public x2: number,
		public y2: number,
		public strokeColor: string,
		public strokeWidth: number
	) {}
}
