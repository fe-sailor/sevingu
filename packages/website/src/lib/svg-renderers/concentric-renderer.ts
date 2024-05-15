import pick from 'lodash/pick';
import {
	Concentric,
	ConcentricSetting,
	PixelPoint,
	concentricSettingSchema,
} from './concentric-renderer-schema';
import {
	SvgSettingSvgurt,
	SvgSetting,
	isInColorThreshold,
	forEachPixelPoints,
	getPixelColorIntensity,
} from './svg-renderer-schema';
import { RenderSvg } from '@/lib/svg-renderers/bases';

export class ConcentricRenderer implements RenderSvg {
	constructor(
		private concentricSetting: SvgSettingSvgurt | SvgSetting,
		private width: number,
		private height: number,
		private pixelRawData: Uint8ClampedArray,
		public instances: Concentric[] = [],
		public instancesRendered: string = ''
	) {}

	renderSvg(): string {
		this.createConcentrics();
		return this.renderConcentrics();
	}

	private createConcentrics() {
		if (!this.concentricSetting) {
			console.error('no concentric setting error');
			return;
		}
		const { renderEveryXPixels, renderEveryYPixels } = this.concentricSetting;

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

				this.instances.push(this.createConcentric(pixelPoint));
			}
		);
		return this.instances;
	}

	private renderConcentrics(): string {
		if (this.instances.length === 0) {
			console.warn('no concentrics');
			return (this.instancesRendered = '');
		}
		return (this.instancesRendered = this.instances.reduce<string>(
			(preString, concentric) =>
				(preString += this.renderConcentric(concentric)),
			''
		));
	}

	private isInColorThreshold(pixelPoint: PixelPoint): boolean {
		return isInColorThreshold(
			pick(pixelPoint, ['r', 'g', 'b', 'a']),
			pick(this.concentricSetting, ['minColorRecognized', 'maxColorRecognized'])
		);
	}

	private createConcentric(pixelPoint: PixelPoint): Concentric {
		const {
			useAutoColor,
			direction,
			directionRandomness,
			concentricLength,
			useLengthOnColor,
			lengthRandomness,
			strokeColor,
			strokeWidth,
			strokeWidthRandomness,
		} = this.adaptSetting(this.concentricSetting);

		const x1 = pixelPoint.x;
		const y1 = pixelPoint.y;

		const concentricColor = useAutoColor
			? `rgb(${pixelPoint.r}, ${pixelPoint.g}, ${pixelPoint.b})`
			: strokeColor;

		const lengthOfConcentric = useLengthOnColor
			? getPixelColorIntensity(
					pick(pixelPoint, ['r', 'g', 'b', 'a']),
					this.concentricSetting
				) * concentricLength
			: concentricLength;

		const dir = -direction + 180 * directionRandomness * Math.random();
		const xMove = lengthOfConcentric * Math.cos(dir * (Math.PI / 180));
		const yMove = lengthOfConcentric * Math.sin(dir * (Math.PI / 180));

		const lenRandom = 1 - Math.random() * lengthRandomness;
		const x2 = x1 + xMove * lenRandom;
		const y2 = y1 + yMove * lenRandom;

		const concentric = {
			x1,
			y1,
			x2,
			y2,
			strokeColor: concentricColor,
			strokeWidth: strokeWidth * (1 - Math.random() * strokeWidthRandomness),
		};

		return new Concentric(
			concentric.x1,
			concentric.y1,
			concentric.x2,
			concentric.y2,
			concentric.strokeColor,
			concentric.strokeWidth
		);
	}

	private renderConcentric(concentric: Concentric): string {
		const { scale } = this.adaptSetting(this.concentricSetting);
		const { x1, y1, x2, y2, strokeWidth, strokeColor } = concentric;
		return `<concentric x1="${x1 * scale}" y1="${
			y1 * scale
		}" x2="${x2 * scale}" y2="${
			y2 * scale
		}" style="stroke: ${strokeColor}; stroke-width: ${strokeWidth}" />`;
	}

	private adaptSetting(
		setting: SvgSettingSvgurt | ConcentricSetting
	): ConcentricSetting {
		if (this.validateConcentricSetting(setting)) {
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
			// minconcentricLength: setting.minconcentricLength,
			// useCrossHatch: setting.crossHatch,
			// amountOfConcentrics: setting.amountOfConcentrics,

			renderEveryXPixels: setting.renderEveryXPixels,
			renderEveryYPixels: setting.renderEveryYPixels,
			concentricLength: setting.concentricLength,
			useLengthOnColor: setting.lengthOnColor,
			lengthRandomness: setting.lengthRandomness,

			direction: setting.direction,
			directionRandomness: setting.directionRandomness,
		};
	}

	private validateConcentricSetting(
		setting: SvgSettingSvgurt | ConcentricSetting
	): setting is ConcentricSetting {
		return concentricSettingSchema.safeParse(setting).success;
	}
}
