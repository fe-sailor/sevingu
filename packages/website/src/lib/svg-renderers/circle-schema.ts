import { z } from 'zod';
import { getPixelColorAtXY } from '@/lib/svg-renderers/svg-service';

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

export const forEachPixelPoints = (
	pixelData: PixelData,
	callBack: (pixelPoint: PixelPoint) => void
) => {
	const { clampedArray, width, height, betweenX, betweenY } = pixelData;
	for (let x = 0; x < width; x += betweenX) {
		for (let y = 0; y < height; y += betweenY) {
			const pixelPoint = {
				x: x,
				y: y,
				...getPixelColorAtXY(clampedArray, x, y, width),
			};
			callBack(pixelPoint);
		}
	}
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
	x: number;
	y: number;
	r: number;
	strokeColor: string;
	strokeWidth: number;

	constructor(
		x: number,
		y: number,
		r: number,
		strokeColor: string,
		strokeWidth: number
	) {
		this.x = x;
		this.y = y;
		this.r = r;
		this.strokeColor = strokeColor;
		this.strokeWidth = strokeWidth;
	}
}
