import pick from 'lodash/pick';
import {
	Line,
	LineSetting,
	PixelPoint,
	lineSettingSchema,
	getPixelColorIntensity,
} from './line-renderer-schema';
import {
	SvgSettingSvgurt,
	SvgSetting,
	isInColorThreshold,
	forEachPixelPoints,
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
			useAutoStrokeColor,
			radius,
			useRadiusColorIntensity,
			radiusRandomness,
			strokeColor,
			strokeWidth,
			strokeWidthRandomness,
		} = this.adaptSetting(this.lineSetting);

		let lineRadius = radius;
		if (useRadiusColorIntensity) {
			lineRadius =
				getPixelColorIntensity(
					pick(pixelPoint, ['r', 'g', 'b', 'a']),
					this.lineSetting
				) * radius;
		}

		lineRadius *= 1 - Math.random() * radiusRandomness;

		const lineColor = useAutoStrokeColor
			? `rgb(${pixelPoint.r}, ${pixelPoint.g}, ${pixelPoint.b})`
			: strokeColor;

		return new Line(
			pixelPoint.x,
			pixelPoint.y,
			lineRadius,
			lineColor,
			strokeWidth * (1 - Math.random() * strokeWidthRandomness)
		);
	}

	private renderLine(line: Line): string {
		const { useFill, fillColor, scale, useStroke } = this.adaptSetting(
			this.lineSetting
		);
		const { x, y, r, strokeWidth, strokeColor } = line;
		return `<line cx="${x * scale}" cy="${
			y * scale
		}" r="${r * scale}" style="stroke: ${
			useStroke ? strokeColor : 'none'
		}; stroke-width: ${strokeWidth}; fill: ${useFill ? fillColor : 'none'};" />`;
	}

	private adaptSetting(setting: SvgSettingSvgurt | LineSetting): LineSetting {
		if (this.validateLineSetting(setting)) {
			return setting;
		}
		return {
			useRadiusColorIntensity: setting.radiusOnColor,
			radius: setting.radius,
			radiusRandomness: setting.radiusRandomness,

			useStroke: setting.stroke,
			useAutoStrokeColor: setting.autoColor,
			strokeColor: setting.strokeColor,
			strokeWidth: setting.strokeWidth,
			strokeWidthRandomness: setting.strokeWidthRandomness,

			renderEveryXPixels: setting.renderEveryXPixels,
			renderEveryYPixels: setting.renderEveryYPixels,

			minColorRecognized: setting.minColorRecognized,
			maxColorRecognized: setting.maxColorRecognized,

			useFill: setting.fill,
			fillColor: setting.fillColor,
			scale: setting.scale,
		};
	}

	private validateLineSetting(
		setting: SvgSettingSvgurt | LineSetting
	): setting is LineSetting {
		return lineSettingSchema.safeParse(setting).success;
	}
}
