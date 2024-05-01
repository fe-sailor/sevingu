import { z } from 'zod';
import { CircleSetting } from '@/lib/svg-renderers/circle-schema';

export const SVG_RENDER_TYPES = z.enum(['CIRCLE']);

export const svgRendererSettingSchema = z.object({
	renderType: SVG_RENDER_TYPES,
	scale: z.number().min(0).max(3),
});

export type SvgRendererSetting = z.infer<typeof svgRendererSettingSchema>;
export type SvgSetting = SvgRendererSetting & CircleSetting;
