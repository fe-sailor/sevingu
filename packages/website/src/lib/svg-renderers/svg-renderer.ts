import {
	RenderSvg,
	SetSetting,
	SetRenderSize,
	SetPixelRawData,
} from '@/lib/svg-renderers/bases';
import { CircleRenderer } from '@/lib/svg-renderers/circle-renderer';
import {
	SvgRendererSetting,
	SvgSetting,
	SvgSettingSvgurt,
	svgRendererSettingSchema,
} from '@/lib/svg-renderers/svg-renderer-schema';
import { exhaustiveTypeCheck, stringJoin } from '@/lib/utils';
import pick from 'lodash/pick';
import { CurveRenderer } from '@/lib/svg-renderers/curve-renderer';
import { LineRenderer } from './line-renderer';
import { RecursiveRenderer } from './recursive-renderer';

export class SvgRenderer
	implements RenderSvg, SetSetting, SetRenderSize, SetPixelRawData
{
	constructor(
		private setting: SvgSettingSvgurt | SvgSetting,
		private width: number,
		private height: number,
		private pixelRawData: Uint8ClampedArray
	) {}

	renderSvg(): string {
		const nameSpaceString =
			'xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"';
		// console.warn(this.getRenderer());
		return stringJoin(
			`<svg ${this.getSizeString()} ${nameSpaceString}>`,
			() => this.getRenderer().renderSvg(),
			'</svg>'
		);
	}

	setRenderSize(width: number, height: number): SvgRenderer {
		this.width = width;
		this.height = height;
		return this.clone();
	}

	setSetting(setting: SvgSettingSvgurt | SvgSetting): SvgRenderer {
		this.setting = setting;
		return this.clone();
	}

	setPixelRawData(pixelRawData: Uint8ClampedArray): SvgRenderer {
		this.pixelRawData = pixelRawData;
		return this.clone();
	}

	private clone(): SvgRenderer {
		return new SvgRenderer(
			this.setting,
			this.width,
			this.height,
			this.pixelRawData
		);
	}

	private getRenderer(): RenderSvg {
		const { renderType } = this.adaptSetting(this.setting);
		switch (renderType) {
			case 'CIRCLE':
				return new CircleRenderer(
					this.setting,
					this.width,
					this.height,
					this.pixelRawData
				);
			case 'CURVE':
				return new CurveRenderer(
					this.setting,
					this.width,
					this.height,
					this.pixelRawData
				);
			case 'LINE':
				return new LineRenderer(
					this.setting,
					this.width,
					this.height,
					this.pixelRawData
				);
			case 'RECURSIVE':
				return new RecursiveRenderer(
					this.setting,
					this.width,
					this.height,
					this.pixelRawData
				);
			default:
				throw exhaustiveTypeCheck(renderType);
		}
	}

	private getSizeString(): string {
		return `height="${this.height * this.setting.scale}" width="${this.width * this.setting.scale}"`;
	}

	private adaptSetting(
		setting: SvgSettingSvgurt | SvgSetting
	): SvgRendererSetting {
		if (this.validateSvgSetting(setting)) {
			return pick(setting, ['renderType', 'scale']);
		}
		return {
			renderType: setting.svgRenderType,
			scale: setting.scale,
		};
	}

	private validateSvgSetting(
		setting: SvgSettingSvgurt | SvgSetting
	): setting is SvgSetting {
		return svgRendererSettingSchema.safeParse(setting).success;
	}
}
