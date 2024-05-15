import { z } from 'zod';
import {
	CircleSetting,
	getPixelColorAtDataIndex,
	PixelPoint,
	PixelData,
} from '@/lib/svg-renderers/circle-renderer-schema';
import { CurveSetting } from '@/lib/svg-renderers/curve-renderer-schema';
import { LineSetting } from '@/lib/svg-renderers/line-renderer-schema';

export const SVG_RENDER_TYPES = z.enum(['CIRCLE', 'CURVE', 'LINE']);

export const svgRendererSettingSchema = z.object({
	renderType: SVG_RENDER_TYPES,
	scale: z.number().min(0).max(3),
});

export type SvgRendererSetting = z.infer<typeof svgRendererSettingSchema>;

// prettier-ignore
export type SvgSetting = SvgRendererSetting
  & CircleSetting
  & CurveSetting
  & LineSetting;

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

	amplitude: number;
	amplitudeRandomness: number;
	direction: number;
	directionRandomness: number;
	wavelength: number;
	wavelengthRandomness: number;
	waves: number;
	wavesRandomness: number;

	continuous: boolean;
	minlienLength: number;
	crossHatch: boolean;
	amountOfLines: number;
	lineLength: number;
	lengthOnColor: boolean;
	lengthRandomness: number;
};

export function getPixelColorAtXY(
	imageData: Uint8ClampedArray,
	x: number,
	y: number,
	width: number
) {
	const dataIndex = (Math.round(x) + Math.round(y) * width) * 4;

	return getPixelColorAtDataIndex(imageData, dataIndex);
}

export function isInColorThreshold(
	pixel: Pick<PixelPoint, 'r' | 'g' | 'b' | 'a'>,
	settings: Pick<SvgSetting, 'minColorRecognized' | 'maxColorRecognized'>
) {
	const { minColorRecognized, maxColorRecognized } = settings;

	return (
		pixel.r >= minColorRecognized &&
		pixel.g >= minColorRecognized &&
		pixel.b >= minColorRecognized &&
		pixel.r <= maxColorRecognized &&
		pixel.g <= maxColorRecognized &&
		pixel.b <= maxColorRecognized
	);
}

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
