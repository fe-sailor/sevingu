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

export const concentricCircleSettingSchema = z.object({
	scale: z.number().int().min(0).max(3),

	useAutoColor: z.boolean(),
	strokeWidth: z.number().min(1).max(100),
	strokeWidthRandomness: z.number().min(0).max(1),
	strokeColor: z.string(),

	circleArcs: z.number().int().min(2).max(400),
	intensityWeight: z.number().int().min(500).max(1000000),
	radiusStep: z.number().int().min(1).max(100),
});

export type ConcentricCircleSetting = z.infer<
	typeof concentricCircleSettingSchema
>;

export class ConcentricCircle {
	constructor(
		public radius: number,
		public ellipses: Ellipse[]
	) {}
}
export class Ellipse {
	constructor(
		public rx: number,
		public ry: number,
		public xRot: number,
		public x: number,
		public y: number
	) {}
}
