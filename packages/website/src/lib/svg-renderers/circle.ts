import {
	SvgSetting,
	getPixelColorIntensity,
	isInColorThreshold,
} from '@/lib/svg-renderers/svg-service';
import _ from 'lodash';
import {
	Circle,
	CircleSetting,
	PixelPoint,
	circleSettingSchema,
	forEachPixelPoints,
} from './circle-schema';

export class CircleService {
	static instances: Circle[] = [];

	static instancesRendered: string;

	static setCircleSetting(setting: SvgSetting | CircleSetting) {
		this.circleSetting = this.adaptSetting(setting);
	}

	static createCircles(
		clampedArray: Uint8ClampedArray,
		width: number,
		height: number
	) {
		if (!this.circleSetting) {
			console.error('no circle setting error');
			return;
		}
		const { renderEveryXPixels, renderEveryYPixels } = this.circleSetting;

		this.instances = [];
		forEachPixelPoints(
			{
				clampedArray: clampedArray,
				width: width,
				height: height,
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

	static renderCircles(): string {
		if (this.instances.length === 0) {
			console.warn('no circles');
			return (this.instancesRendered = '');
		}
		return (this.instancesRendered = this.instances.reduce<string>(
			(preString, circle) => (preString += this.renderCircle(circle)),
			''
		));
	}

	private static circleSetting: CircleSetting;

	private static isInColorThreshold(pixelPoint: PixelPoint): boolean {
		return isInColorThreshold(
			_.pick(pixelPoint, ['r', 'g', 'b', 'a']),
			_.pick(this.circleSetting, ['minColorRecognized', 'maxColorRecognized'])
		);
	}

	private static createCircle(pixelPoint: PixelPoint): Circle {
		const {
			useAutoStrokeColor,
			radius,
			useRadiusColorIntensity,
			radiusRandomness,
			strokeColor,
			strokeWidth,
			strokeWidthRandomness,
		} = this.circleSetting;

		let circleRadius = radius;
		if (useRadiusColorIntensity) {
			circleRadius =
				getPixelColorIntensity(
					_.pick(pixelPoint, ['r', 'g', 'b', 'a']),
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

	private static renderCircle(circle: Circle): string {
		const { useFill, fillColor, scale, useStroke } = this.circleSetting;
		const { x, y, r, strokeWidth, strokeColor } = circle;
		return `<circle cx="${x * scale}" cy="${
			y * scale
		}" r="${r * scale}" style="stroke: ${
			useStroke ? strokeColor : 'none'
		}; stroke-width: ${strokeWidth}; fill: ${useFill ? fillColor : 'none'};" />`;
	}

	private static adaptSetting(
		setting: SvgSetting | CircleSetting
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

	private static validateCircleSetting(
		setting: SvgSetting | CircleSetting
	): setting is CircleSetting {
		return circleSettingSchema.safeParse(setting).success;
	}
}
