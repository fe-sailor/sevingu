import { z } from 'zod';
import { CircleSetting } from '@/lib/svg-renderers/circle-renderer-schema';

export const SVG_RENDER_TYPES = z.enum(['CIRCLE']);

export const svgRendererSettingSchema = z.object({
	renderType: SVG_RENDER_TYPES,
	scale: z.number().min(0).max(3),
});

export type SvgRendererSetting = z.infer<typeof svgRendererSettingSchema>;
export type SvgSetting = SvgRendererSetting & CircleSetting;

export type SvgSettingSvgurt = {
	scale: number;
	fill: boolean;
	fillColor: string;
	stroke: boolean;
	svgRenderType: z.infer<typeof SVG_RENDER_TYPES>;
	autoColor: boolean;
	applyFractalDisplacement: string;
	radius: number;
	radiusOnColor: boolean;
	radiusRandomness: number;
	strokeColor: string;
	strokeWidth: number;
	strokeWidthRandomness: number;
	renderEveryXPixels: number;
	renderEveryYPixels: number;
	minColorRecognized: number;
	maxColorRecognized: number;
};
