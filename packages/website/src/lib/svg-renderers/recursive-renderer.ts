import pick from 'lodash/pick';
import {
	Recursive,
	RecursiveSetting,
	PixelPoint,
	recursiveSettingSchema,
} from './recursive-renderer-schema';
import {
	SvgSettingSvgurt,
	SvgSetting,
	isInColorThreshold,
	forEachPixelPoints,
	getPixelColorIntensity,
} from './svg-renderer-schema';
import { RenderSvg } from '@/lib/svg-renderers/bases';

export class RecursiveRenderer implements RenderSvg {
	constructor(
		private recursiveSetting: SvgSettingSvgurt | SvgSetting,
		private width: number,
		private height: number,
		private pixelRawData: Uint8ClampedArray,
		public instances: Recursive[] = [],
		public instancesRendered: string = ''
	) {}

	renderSvg(): string {
		this.createRecursives();
		return this.renderRecursives();
	}

	private createRecursives() {
		if (!this.recursiveSetting) {
			console.error('no recursive setting error');
			return;
		}
		const { renderEveryXPixels, renderEveryYPixels } = this.recursiveSetting;

		forEachPixelPoints(
			{
				clampedArray: this.pixelRawData,
				width: this.width,
				height: this.height,
				betweenX: renderEveryXPixels,
				betweenY: renderEveryYPixels,
			},
			pixelPoint => {
				if (!this.isInColorThreshold(pixelPoint)) {
					return;
				}

				this.instances.push(this.createRecursive(pixelPoint));
			}
		);
		return this.instances;
	}

	private renderRecursives(): string {
		if (this.instances.length === 0) {
			console.warn('no recursives');
			return (this.instancesRendered = '');
		}
		return (this.instancesRendered = this.instances.reduce<string>(
			(preString, recursive) => (preString += this.renderRecursive(recursive)),
			''
		));
	}

	private isInColorThreshold(pixelPoint: PixelPoint): boolean {
		return isInColorThreshold(
			pick(pixelPoint, ['r', 'g', 'b', 'a']),
			pick(this.recursiveSetting, ['minColorRecognized', 'maxColorRecognized'])
		);
	}

	private createRecursive(pixelPoint: PixelPoint): Recursive {
		const {
			useAutoColor,
			direction,
			directionRandomness,
			lineLength,
			useLengthOnColor,
			lengthRandomness,
			strokeColor,
			strokeWidth,
			strokeWidthRandomness,
		} = this.adaptSetting(this.recursiveSetting);

		const x1 = pixelPoint.x;
		const y1 = pixelPoint.y;

		const recursiveColor = useAutoColor
			? `rgb(${pixelPoint.r}, ${pixelPoint.g}, ${pixelPoint.b})`
			: strokeColor;

		const lengthOfRecursive = useLengthOnColor
			? getPixelColorIntensity(
					pick(pixelPoint, ['r', 'g', 'b', 'a']),
					this.recursiveSetting
				) * lineLength
			: lineLength;

		const dir = -direction + 180 * directionRandomness * Math.random();
		const xMove = lengthOfRecursive * Math.cos(dir * (Math.PI / 180));
		const yMove = lengthOfRecursive * Math.sin(dir * (Math.PI / 180));

		const lenRandom = 1 - Math.random() * lengthRandomness;
		const x2 = x1 + xMove * lenRandom;
		const y2 = y1 + yMove * lenRandom;

		const recursive = {
			x1,
			y1,
			x2,
			y2,
			strokeColor: recursiveColor,
			strokeWidth: strokeWidth * (1 - Math.random() * strokeWidthRandomness),
		};

		return new Recursive(
			recursive.x1,
			recursive.y1,
			recursive.x2,
			recursive.y2,
			recursive.strokeColor,
			recursive.strokeWidth
		);
	}

	private renderRecursive(recursive: Recursive): string {
		const { scale } = this.adaptSetting(this.recursiveSetting);
		const { x1, y1, x2, y2, strokeWidth, strokeColor } = recursive;
		return `<recursive x1="${x1 * scale}" y1="${
			y1 * scale
		}" x2="${x2 * scale}" y2="${
			y2 * scale
		}" style="stroke: ${strokeColor}; stroke-width: ${strokeWidth}" />`;
	}

	private adaptSetting(
		setting: SvgSettingSvgurt | RecursiveSetting
	): RecursiveSetting {
		if (this.validateRecursiveSetting(setting)) {
			return setting;
		}
		return {
			scale: setting.scale,

			minColorRecognized: setting.minColorRecognized,
			maxColorRecognized: setting.maxColorRecognized,

			useStroke: setting.stroke,
			useAutoStrokeColor: setting.autoColor,
			strokeWidth: setting.strokeWidth,
			strokeWidthRandomness: setting.strokeWidthRandomness,
			useAutoColor: setting.autoColor,
			strokeColor: setting.strokeColor,

			// NOTE: 일단 추후 추가
			// useContinuous: setting.continuous,
			// minrecursiveLength: setting.minlienLength,
			// useCrossHatch: setting.crossHatch,
			// amountOfRecursives: setting.amountOfRecursives,

			renderEveryXPixels: setting.renderEveryXPixels,
			renderEveryYPixels: setting.renderEveryYPixels,
			lineLength: setting.lineLength,
			useLengthOnColor: setting.lengthOnColor,
			lengthRandomness: setting.lengthRandomness,

			direction: setting.direction,
			directionRandomness: setting.directionRandomness,
		};
	}

	private validateRecursiveSetting(
		setting: SvgSettingSvgurt | RecursiveSetting
	): setting is RecursiveSetting {
		return recursiveSettingSchema.safeParse(setting).success;
	}
}
