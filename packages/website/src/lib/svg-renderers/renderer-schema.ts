import { z } from 'zod';
export const svgRendererSettingSchema = z.object({
	renderType: z.enum(['CIRCLE']),

	scale: z.number().min(0).max(255),
});

export type SvgRendererSetting = z.infer<typeof svgRendererSettingSchema>;
