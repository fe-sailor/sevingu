import { z } from 'zod';

export const canvasSettingSchema = z.object({
	useGrayscale: z.boolean(),
	useInvert: z.boolean(),
	blur: z.number().int().min(0).max(30),
	usePosterize: z.boolean(),
	posterizeLevels: z.number().int().min(1).max(30),
	useEdgeDetection: z.boolean(),
	lowThreshold: z.number().int().min(0).max(128),
	highThreshold: z.number().int().min(0).max(128),
	postBlur: z.number().int().min(0).max(30),
});

export type CanvasSettingSvgurt = {
	grayscale: boolean;
	invert: boolean;
	blur: number;
	postBlur: number;
	posterize: boolean;
	posterizeLevels: number;
	edgeDetection: boolean;
	lowThreshold: number;
	highThreshold: number;
};

export type PromiseWithResolvers<T> = {
	promise: Promise<T>;
	resolve: (value: T | PromiseLike<T>) => void;
	reject: (reason?: unknown) => void;
};
export type ImageConfiguration = { blur: number };

export type ImageSize = {
	imageElement: HTMLImageElement;
	width: number;
	height: number;
};
