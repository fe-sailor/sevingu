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
	getPixelColorAtXY,
} from './svg-renderer-schema';
import { RenderSvg } from '@/lib/svg-renderers/bases';
import { Ellipse } from '@/lib/svg-renderers/concentric-circle-renderer-schema';
import { stringJoin } from '../utils';

export class ConcentricCircleRenderer implements RenderSvg {
	constructor(
		private concentricCircleSetting: SvgSettingSvgurt | SvgSetting,
		private width: number,
		private height: number,
		private pixelRawData: Uint8ClampedArray,
		public instances: ConcentricCircle[] = [],
		public instancesRendered: string = ''
	) {
		if (this.validateConcentricCircleSetting(concentricCircleSetting)) {
			concentricCircleSetting;
		}
	}

	renderSvg(): string {
		this.createConcentricCircles();
		return this.renderConcentricCircles();
	}

	private createConcentricCircles() {
		if (!this.concentricCircleSetting) {
			console.error('no concentricCircle setting error');
			return;
		}
		const { radiusStep } = this.adaptSetting(this.concentricCircleSetting);
		const maxRadius = Math.max(this.width, this.height) / 2;
		for (let r = radiusStep; r <= maxRadius; r += radiusStep) {
			this.instances.push(this.createConcentricCircle(r));
		}

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

	private isInColorThreshold(
		pixelPoint: PixelPoint | Pick<PixelPoint, 'r' | 'g' | 'b' | 'a'>
	): boolean {
		return isInColorThreshold(
			pick(pixelPoint, ['r', 'g', 'b', 'a']),
			pick(this.concentricCircleSetting, [
				'minColorRecognized',
				'maxColorRecognized',
			])
		);
	}

	private createConcentricCircle(radius: number): ConcentricCircle {
		const { circleArcs, intensityWeight } = this.adaptSetting(
			this.concentricCircleSetting
		);

		const centerX = this.width / 2;
		const centerY = this.height / 2;

		const arcAngle = (2 * Math.PI) / circleArcs; // hardcoded to 1 degree for now

		const ellipses: Ellipse[] = [];
		for (let i = 1; i <= circleArcs; i++) {
			const xNew = centerX + radius * Math.sin(arcAngle * i);
			const yNew = centerY - radius * Math.cos(arcAngle * i);

			const xArcCenter =
				centerX + radius * Math.sin(arcAngle * i - arcAngle / 2);
			const yArcCenter =
				centerY - radius * Math.cos(arcAngle * i - arcAngle / 2);

			const pixelColor = getPixelColorAtXY(
				this.pixelRawData,
				xArcCenter,
				yArcCenter,
				centerX * 2
			);
			let eclipseHeight = radius;
			if (this.isInColorThreshold(pixelColor)) {
				const intensity = getPixelColorIntensity(
					pixelColor,
					this.concentricCircleSetting
				);
				eclipseHeight = intensity * intensityWeight + radius;
			}

			const pathArc = {
				rx: radius,
				ry: eclipseHeight,
				xRot: ((i * arcAngle - arcAngle / 2) * 360) / (2 * Math.PI),
				x: xNew,
				y: yNew,
			};
			ellipses.push(pathArc);
		}

		return new ConcentricCircle(radius, ellipses);
	}

	private renderConcentricCircle(concentricCircle: ConcentricCircle): string {
		const { scale, strokeColor, strokeWidth, useAutoColor } = this.adaptSetting(
			this.concentricCircleSetting
		);

		const centerX = this.width / 2;
		const centerY = this.height / 2;
		// TODO: 개별 색상 적용해야 이쁠듯
		return [
			`<path d="M ${centerX * scale} ${
				centerY * scale
			} m 0 ${-concentricCircle.radius * scale}`,
			...concentricCircle.ellipses.map(({ rx, ry, xRot, x, y }) => {
				return ` A ${rx * scale} ${ry * scale} ${xRot} 0 1 ${x * scale} ${y * scale}`;
			}),
			`" stroke="${strokeColor}" stroke-width="${strokeWidth}" style="fill: none;" />`,
		].join('');
	}

	private adaptSetting(
		setting: SvgSettingSvgurt | ConcentricCircleSetting
	): ConcentricCircleSetting {
		if (this.validateConcentricCircleSetting(setting)) {
			return setting;
		}
		return {
			scale: setting.scale,
			useAutoColor: setting.autoColor,
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
