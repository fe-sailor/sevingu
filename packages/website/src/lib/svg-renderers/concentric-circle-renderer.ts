import pick from 'lodash/pick';
import {
	ConcentricCircle,
	ConcentricCircleSetting,
	PixelPoint,
	concentricCircleSettingSchema,
} from './concentric-circle-renderer-schema';
import {
	SvgSettingSvgurt,
	SvgSetting,
	isInColorThreshold,
	forEachPixelPoints,
	getPixelColorIntensity,
} from './svg-renderer-schema';
import { RenderSvg } from '@/lib/svg-renderers/bases';

export class ConcentricCircleRenderer implements RenderSvg {
	constructor(
		private concentricCircleSetting: SvgSettingSvgurt | SvgSetting,
		private width: number,
		private height: number,
		private pixelRawData: Uint8ClampedArray,
		public instances: ConcentricCircle[] = [],
		public instancesRendered: string = ''
	) {}

	renderSvg(): string {
		this.createConcentricCircles();
		return this.renderConcentricCircles();
	}

	private createConcentricCircles() {
		if (!this.concentricCircleSetting) {
			console.error('no concentricCircle setting error');
			return;
		}
		const { renderEveryXPixels, renderEveryYPixels } =
			this.concentricCircleSetting;

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

				this.instances.push(this.createConcentricCircle(pixelPoint));
			}
		);
		return this.instances;
	}

	private renderConcentricCircles(): string {
		if (this.instances.length === 0) {
			console.warn('no concentricCircles');
			return (this.instancesRendered = '');
		}
		return (this.instancesRendered = this.instances.reduce<string>(
			(preString, concentricCircle) =>
				(preString += this.renderConcentricCircle(concentricCircle)),
			''
		));
	}

	private isInColorThreshold(pixelPoint: PixelPoint): boolean {
		return isInColorThreshold(
			pick(pixelPoint, ['r', 'g', 'b', 'a']),
			pick(this.concentricCircleSetting, [
				'minColorRecognized',
				'maxColorRecognized',
			])
		);
	}

	private createConcentricCircle(pixelPoint: PixelPoint): ConcentricCircle {
		const {
			useAutoColor,
			direction,
			directionRandomness,
			concentricCircleLength,
			useLengthOnColor,
			lengthRandomness,
			strokeColor,
			strokeWidth,
			strokeWidthRandomness,
		} = this.adaptSetting(this.concentricCircleSetting);

		const x1 = pixelPoint.x;
		const y1 = pixelPoint.y;

		const concentricCircleColor = useAutoColor
			? `rgb(${pixelPoint.r}, ${pixelPoint.g}, ${pixelPoint.b})`
			: strokeColor;

		const lengthOfConcentricCircle = useLengthOnColor
			? getPixelColorIntensity(
					pick(pixelPoint, ['r', 'g', 'b', 'a']),
					this.concentricCircleSetting
				) * concentricCircleLength
			: concentricCircleLength;

		const dir = -direction + 180 * directionRandomness * Math.random();
		const xMove = lengthOfConcentricCircle * Math.cos(dir * (Math.PI / 180));
		const yMove = lengthOfConcentricCircle * Math.sin(dir * (Math.PI / 180));

		const lenRandom = 1 - Math.random() * lengthRandomness;
		const x2 = x1 + xMove * lenRandom;
		const y2 = y1 + yMove * lenRandom;

		const concentricCircle = {
			x1,
			y1,
			x2,
			y2,
			strokeColor: concentricCircleColor,
			strokeWidth: strokeWidth * (1 - Math.random() * strokeWidthRandomness),
		};

		return new ConcentricCircle(
			concentricCircle.x1,
			concentricCircle.y1,
			concentricCircle.x2,
			concentricCircle.y2,
			concentricCircle.strokeColor,
			concentricCircle.strokeWidth
		);
	}

	private renderConcentricCircle(concentricCircle: ConcentricCircle): string {
		const { scale } = this.adaptSetting(this.concentricCircleSetting);
		const { x1, y1, x2, y2, strokeWidth, strokeColor } = concentricCircle;
		return `<concentricCircle x1="${x1 * scale}" y1="${
			y1 * scale
		}" x2="${x2 * scale}" y2="${
			y2 * scale
		}" style="stroke: ${strokeColor}; stroke-width: ${strokeWidth}" />`;
	}

	private adaptSetting(
		setting: SvgSettingSvgurt | ConcentricCircleSetting
	): ConcentricCircleSetting {
		if (this.validateConcentricCircleSetting(setting)) {
			return setting;
		}
		return {
			scale: setting.scale,
			strokeWidth: setting.strokeWidth,
			strokeWidthRandomness: setting.strokeWidthRandomness,
			strokeColor: setting.strokeColor,
			circleArcs: setting.circleArcs,
			intensityWeight: setting.intensityWeight,
			radiusStep: setting.radiusStep,
		};
	}

	private validateConcentricCircleSetting(
		setting: SvgSettingSvgurt | ConcentricCircleSetting
	): setting is ConcentricCircleSetting {
		return concentricCircleSettingSchema.safeParse(setting).success;
	}
}
