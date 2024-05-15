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
	getPixelColorAtXY,
} from './svg-renderer-schema';
import { RenderSvg } from '@/lib/svg-renderers/bases';

export class RecursiveRenderer implements RenderSvg {
	isTraveledPosition: boolean[][] = [];
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

		for (let x = 0; x < this.width; x += renderEveryXPixels) {
			this.isTraveledPosition[x] = [];
		}

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
		const { strokeColor, strokeWidth, useAutoColor, strokeWidthRandomness } =
			this.adaptSetting(this.recursiveSetting);
		const pixelColor = getPixelColorAtXY(
			this.pixelRawData,
			pixelPoint.x,
			pixelPoint.y,
			this.width
		);
		const pathColor = useAutoColor
			? `rgb(${pixelColor.r}, ${pixelColor.g}, ${pixelColor.b})`
			: strokeColor;

		return new Recursive(
			pixelPoint.x,
			pixelPoint.y,
			pathColor,
			strokeWidth * (1 - Math.random() * strokeWidthRandomness)
		);
	}

	private renderRecursive(recursive: Recursive): string {
		const { scale } = this.adaptSetting(this.recursiveSetting);
		const { strokeWidth, strokeColor } = recursive;
		const pathString = recursive.getRecursivePath(
			scale,
			recursive.buildRecursivePath(
				this.adaptSetting(this.recursiveSetting),
				this.pixelRawData,
				this.width,
				this.height,
				this.isTraveledPosition,
				0
			)
		);
		return `<path d="${pathString}" style="stroke: ${strokeColor}; stroke-width: ${strokeWidth}; fill: none;" />`;
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
			renderEveryXPixels: setting.renderEveryXPixels,
			renderEveryYPixels: setting.renderEveryYPixels,
			useAutoColor: setting.autoStrokeColor,
			strokeColor: setting.strokeColor,
			strokeWidth: setting.strokeWidth,
			strokeWidthRandomness: setting.strokeWidthRandomness,
			recursiveAlgorithm: setting.recursiveAlgorithm,
			maxRecursiveDepth: setting.maxRecursiveDepth,
		};
	}

	private validateRecursiveSetting(
		setting: SvgSettingSvgurt | RecursiveSetting
	): setting is RecursiveSetting {
		return recursiveSettingSchema.safeParse(setting).success;
	}
}
