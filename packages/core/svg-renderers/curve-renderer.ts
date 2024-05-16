import { RenderSvg } from './bases';
import { PixelPoint } from './circle-renderer-schema';
import { ControlPoint, CurveSetting } from './curve-renderer-schema';
import {
	SvgSetting,
	SvgSettingSvgurt,
	forEachPixelPoints,
} from './svg-renderer-schema';
import pick from 'lodash/pick';
import { Curve, curveSettingSchema } from './curve-renderer-schema';
import { isInColorThreshold } from './svg-renderer-schema';

export class CurveRenderer implements RenderSvg {
	constructor(
		private curveSetting: SvgSettingSvgurt | SvgSetting,
		private width: number,
		private height: number,
		private pixelRawData: Uint8ClampedArray,
		public instances: Curve[] = [],
		public instancesRendered: string = ''
	) {}

	renderSvg(): string {
		this.createCurves();
		return this.renderCurves();
	}

	private renderCurves(): string {
		if (this.instances.length === 0) {
			console.warn('no curves');
			return (this.instancesRendered = '');
		}
		return (this.instancesRendered = this.instances.reduce<string>(
			(preString, curve) => (preString += this.renderCurve(curve)),
			''
		));
	}

	private createCurves() {
		if (!this.curveSetting) {
			console.error('no circle setting error');
			return;
		}
		const { renderEveryXPixels, renderEveryYPixels } = this.adaptSetting(
			this.curveSetting
		);

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

				this.instances.push(this.createCurve(pixelPoint));
			}
		);
		return this.instances;
	}

	private createCurve(pixelPoint: PixelPoint): Curve {
		const {
			useAutoStrokeColor,
			strokeColor,
			strokeWidth,
			strokeWidthRandomness,
		} = this.adaptSetting(this.curveSetting);

		const curveColor = useAutoStrokeColor
			? `rgb(${pixelPoint.r}, ${pixelPoint.g}, ${pixelPoint.b})`
			: strokeColor;

		return new Curve(
			pixelPoint.x,
			pixelPoint.y,
			this.createControlPoints(pixelPoint),
			curveColor,
			strokeWidth * (1 - Math.random() * strokeWidthRandomness)
		);
	}

	private createControlPoints(pixelPoint: PixelPoint): ControlPoint[] {
		const {
			amplitude,
			amplitudeRandomness,
			direction,
			directionRandomness,
			wavelength,
			wavelengthRandomness,
			waves,
			wavesRandomness,
		} = this.adaptSetting(this.curveSetting);

		const x = pixelPoint.x;
		const y = pixelPoint.y;
		const dir = -direction + 180 * directionRandomness * Math.random();
		const xDir = Math.cos(dir * (Math.PI / 180));
		const yDir = Math.sin(dir * (Math.PI / 180));
		const inverseXDir = Math.cos((dir - 90) * (Math.PI / 180));
		const inverseYDir = Math.sin((dir - 90) * (Math.PI / 180));
		const wavelen = wavelength * (1 - Math.random() * wavelengthRandomness);
		const amp = amplitude * (1 - Math.random() * amplitudeRandomness);
		const wavAmount = Math.round(waves * (1 - Math.random() * wavesRandomness));
		const controlPoints: { x: number; y: number }[] = [];
		for (let i = 0; i < wavAmount; i++) {
			controlPoints.push(
				{
					x: x + ((i * wavelen + wavelen / 4) * xDir + inverseXDir * amp),
					y: y + ((i * wavelen + wavelen / 4) * yDir + inverseYDir * amp),
				},
				{
					x: x + ((i * wavelen + wavelen * (3 / 4)) * xDir - inverseXDir * amp),
					y: y + ((i * wavelen + wavelen * (3 / 4)) * yDir - inverseYDir * amp),
				},
				{
					x: x + (i + 1) * wavelen * xDir,
					y: y + (i + 1) * wavelen * yDir,
				}
			);
		}
		return controlPoints;
	}

	private renderCurve(curve: Curve): string {
		const { scale } = this.adaptSetting(this.curveSetting);

		const { x, y, controlPoints, strokeWidth, strokeColor } = curve;
		if (controlPoints.length === 0) {
			return '';
		}
		const curvePath = controlPoints.reduce(
			(prevString, controlPoint, index) =>
				(prevString +=
					` ${controlPoint.x * scale} ${controlPoint.y * scale}` +
					(index === controlPoints.length - 1 ? '' : ',')),
			`M ${x * scale} ${y * scale} C`
		);

		return `<path d="${curvePath}" style="stroke: ${strokeColor}; stroke-width: ${strokeWidth}; fill: none;" />`;
	}

	private isInColorThreshold(pixelPoint: PixelPoint): boolean {
		return isInColorThreshold(
			pick(pixelPoint, ['r', 'g', 'b', 'a']),
			pick(this.curveSetting, ['minColorRecognized', 'maxColorRecognized'])
		);
	}

	private adaptSetting(setting: SvgSettingSvgurt | CurveSetting): CurveSetting {
		if (this.validateCurveSetting(setting)) {
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

			amplitude: setting.amplitude,
			amplitudeRandomness: setting.amplitudeRandomness,
			direction: setting.direction,
			directionRandomness: setting.directionRandomness,
			wavelength: setting.wavelength,
			wavelengthRandomness: setting.wavelengthRandomness,
			waves: setting.waves,
			wavesRandomness: setting.wavesRandomness,

			renderEveryXPixels: setting.renderEveryXPixels,
			renderEveryYPixels: setting.renderEveryYPixels,

			minColorRecognized: setting.minColorRecognized,
			maxColorRecognized: setting.maxColorRecognized,

			useFill: setting.fill,
			fillColor: setting.fillColor,
			scale: setting.scale,
		};
	}

	private validateCurveSetting(
		setting: SvgSettingSvgurt | CurveSetting
	): setting is CurveSetting {
		return curveSettingSchema.safeParse(setting).success;
	}
}
