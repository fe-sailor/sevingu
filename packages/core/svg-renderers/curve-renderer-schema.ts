import { z } from 'zod';

export class Curve {
	constructor(
		public x: number,
		public y: number,
		public controlPoints: ControlPoint[],
		public strokeColor: string,
		public strokeWidth: number
	) {}
}

export type ControlPoint = {
	x: number;
	y: number;
};

export const curveSettingSchema = z.object({
	useRadiusColorIntensity: z.boolean(),
	radius: z.number().int().min(0).max(50),
	radiusRandomness: z.number().min(0).max(1),

	useStroke: z.boolean(),
	useAutoStrokeColor: z.boolean(),
	strokeColor: z.string(),
	strokeWidth: z.number().min(1).max(100),
	strokeWidthRandomness: z.number().min(0).max(1),

	amplitude: z.number().min(0).max(100),
	amplitudeRandomness: z.number().min(0).max(1),
	direction: z.number().int().min(0).max(360),
	directionRandomness: z.number().min(0).max(1),
	wavelength: z.number().min(0).max(100),
	wavelengthRandomness: z.number().min(0).max(1),
	waves: z.number().min(0).max(50),
	wavesRandomness: z.number().min(0).max(1),

	renderEveryXPixels: z.number().min(1).max(50),
	renderEveryYPixels: z.number().min(1).max(50),

	minColorRecognized: z.number().min(0).max(255),
	maxColorRecognized: z.number().min(0).max(255),

	useFill: z.boolean(),
	fillColor: z.string(),

	scale: z.number().min(0).max(3),
});

export type CurveSetting = z.infer<typeof curveSettingSchema>;
