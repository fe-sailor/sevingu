import pick from 'lodash/pick';
import {
	Line,
	LineSetting,
	PixelPoint,
	lineSettingSchema,
} from './line-renderer-schema';
import {
	SvgSettingSvgurt,
	SvgSetting,
	isInColorThreshold,
	forEachPixelPoints,
	getPixelColorIntensity,
} from './svg-renderer-schema';
import { RenderSvg } from '@/lib/svg-renderers/bases';

export class LineRenderer implements RenderSvg {
	constructor(
		private lineSetting: SvgSettingSvgurt | SvgSetting,
		private width: number,
		private height: number,
		private pixelRawData: Uint8ClampedArray,
		public instances: Line[] = [],
		public instancesRendered: string = ''
	) {}

	renderSvg(): string {
		this.createLines();
		return this.renderLines();
	}

	private createLines() {
		if (!this.lineSetting) {
			console.error('no line setting error');
			return;
		}
		const { renderEveryXPixels, renderEveryYPixels } = this.lineSetting;

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

				this.instances.push(this.createLine(pixelPoint));
			}
		);
		return this.instances;
	}

	private renderLines(): string {
		if (this.instances.length === 0) {
			console.warn('no lines');
			return (this.instancesRendered = '');
		}
		return (this.instancesRendered = this.instances.reduce<string>(
			(preString, line) => (preString += this.renderLine(line)),
			''
		));
	}

	private isInColorThreshold(pixelPoint: PixelPoint): boolean {
		return isInColorThreshold(
			pick(pixelPoint, ['r', 'g', 'b', 'a']),
			pick(this.lineSetting, ['minColorRecognized', 'maxColorRecognized'])
		);
	}

	private createLine(pixelPoint: PixelPoint): Line {
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
		} = this.adaptSetting(this.lineSetting);

		const x1 = pixelPoint.x;
		const y1 = pixelPoint.y;

		const lineColor = useAutoColor
			? `rgb(${pixelPoint.r}, ${pixelPoint.g}, ${pixelPoint.b})`
			: strokeColor;

		const lengthOfLine = useLengthOnColor
			? getPixelColorIntensity(
					pick(pixelPoint, ['r', 'g', 'b', 'a']),
					this.lineSetting
				) * lineLength
			: lineLength;

		const dir = -direction + 180 * directionRandomness * Math.random();
		const xMove = lengthOfLine * Math.cos(dir * (Math.PI / 180));
		const yMove = lengthOfLine * Math.sin(dir * (Math.PI / 180));

		const lenRandom = 1 - Math.random() * lengthRandomness;
		const x2 = x1 + xMove * lenRandom;
		const y2 = y1 + yMove * lenRandom;

		const line = {
			x1,
			y1,
			x2,
			y2,
			strokeColor: lineColor,
			strokeWidth: strokeWidth * (1 - Math.random() * strokeWidthRandomness),
		};

		return new Line(
			line.x1,
			line.y1,
			line.x2,
			line.y2,
			line.strokeColor,
			line.strokeWidth
		);
	}

	private renderLine(line: Line): string {
		const { scale } = this.adaptSetting(this.lineSetting);
		const { x1, y1, x2, y2, strokeWidth, strokeColor } = line;
		return `<line x1="${x1 * scale}" y1="${
			y1 * scale
		}" x2="${x2 * scale}" y2="${
			y2 * scale
		}" style="stroke: ${strokeColor}; stroke-width: ${strokeWidth}" />`;
	}

	private adaptSetting(setting: SvgSettingSvgurt | LineSetting): LineSetting {
		if (this.validateLineSetting(setting)) {
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

			useContinuous: setting.continuous,
			minlineLength: setting.minlienLength,
			useCrossHatch: setting.crossHatch,
			amountOfLines: setting.amountOfLines,

			renderEveryXPixels: setting.renderEveryXPixels,
			renderEveryYPixels: setting.renderEveryYPixels,
			lineLength: setting.lineLength,
			useLengthOnColor: setting.lengthOnColor,
			lengthRandomness: setting.lengthRandomness,

			direction: setting.direction,
			directionRandomness: setting.directionRandomness,
		};
	}

	private validateLineSetting(
		setting: SvgSettingSvgurt | LineSetting
	): setting is LineSetting {
		return lineSettingSchema.safeParse(setting).success;
	}
}
