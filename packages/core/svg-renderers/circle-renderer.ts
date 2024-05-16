import pick from 'lodash/pick';
import {
	Circle,
	CircleSetting,
	PixelPoint,
	circleSettingSchema,
} from './circle-renderer-schema';
import {
	SvgSettingSvgurt,
	SvgSetting,
	isInColorThreshold,
	forEachPixelPoints,
	getPixelColorIntensity,
} from './svg-renderer-schema';
import { RenderSvg } from './bases';

export class CircleRenderer implements RenderSvg {
	constructor(
		private circleSetting: SvgSettingSvgurt | SvgSetting,
		private width: number,
		private height: number,
		private pixelRawData: Uint8ClampedArray,
		public instances: Circle[] = [],
		public instancesRendered: string = ''
	) {}

	renderSvg(): string {
		this.createCircles();
		return this.renderCircles();
	}

	private createCircles() {
		if (!this.circleSetting) {
			console.error('no circle setting error');
			return;
		}
		const { renderEveryXPixels, renderEveryYPixels } = this.circleSetting;

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

				this.instances.push(this.createCircle(pixelPoint));
			}
		);
		return this.instances;
	}

	private renderCircles(): string {
		if (this.instances.length === 0) {
			console.warn('no circles');
			return (this.instancesRendered = '');
		}
		return (this.instancesRendered = this.instances.reduce<string>(
			(preString, circle) => (preString += this.renderCircle(circle)),
			''
		));
	}

	private isInColorThreshold(pixelPoint: PixelPoint): boolean {
		return isInColorThreshold(
			pick(pixelPoint, ['r', 'g', 'b', 'a']),
			pick(this.circleSetting, ['minColorRecognized', 'maxColorRecognized'])
		);
	}

	private createCircle(pixelPoint: PixelPoint): Circle {
		const {
			useAutoStrokeColor,
			radius,
			useRadiusColorIntensity,
			radiusRandomness,
			strokeColor,
			strokeWidth,
			strokeWidthRandomness,
		} = this.adaptSetting(this.circleSetting);

		let circleRadius = radius;
		if (useRadiusColorIntensity) {
			circleRadius =
				getPixelColorIntensity(
					pick(pixelPoint, ['r', 'g', 'b', 'a']),
					this.circleSetting
				) * radius;
		}

		circleRadius *= 1 - Math.random() * radiusRandomness;

		const circleColor = useAutoStrokeColor
			? `rgb(${pixelPoint.r}, ${pixelPoint.g}, ${pixelPoint.b})`
			: strokeColor;

		return new Circle(
			pixelPoint.x,
			pixelPoint.y,
			circleRadius,
			circleColor,
			strokeWidth * (1 - Math.random() * strokeWidthRandomness)
		);
	}

	private renderCircle(circle: Circle): string {
		const { useFill, fillColor, scale, useStroke } = this.adaptSetting(
			this.circleSetting
		);
		const { x, y, r, strokeWidth, strokeColor } = circle;
		return `<circle cx="${x * scale}" cy="${
			y * scale
		}" r="${r * scale}" style="stroke: ${
			useStroke ? strokeColor : 'none'
		}; stroke-width: ${strokeWidth}; fill: ${useFill ? fillColor : 'none'};" />`;
	}

	private adaptSetting(
		setting: SvgSettingSvgurt | CircleSetting
	): CircleSetting {
		if (this.validateCircleSetting(setting)) {
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

	private validateCircleSetting(
		setting: SvgSettingSvgurt | CircleSetting
	): setting is CircleSetting {
		return circleSettingSchema.safeParse(setting).success;
	}
}
