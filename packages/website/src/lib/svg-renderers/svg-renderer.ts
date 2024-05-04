import { RenderSvg } from '@/lib/svg-renderers/bases';
import { CircleService } from '@/lib/svg-renderers/circle';
import {
	SvgRendererSetting,
	SvgSetting,
	svgRendererSettingSchema,
} from '@/lib/svg-renderers/svg-renderer-schema';
import { exhaustiveTypeCheck, stringJoin } from '@/lib/utils';
import { SvgSettingSvgurt } from '@/stores/store';
import pick from 'lodash/pick';

export class SvgRenderService {
	private static setting: SvgRendererSetting;
	private static width: number;
	private static height: number;
	private static pixelRawData: Uint8ClampedArray;

	static renderSvg = () => {
		const nameSpaceString =
			'xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"';
		console.warn(this.getRenderer());
		return stringJoin(
			`<svg ${this.getSizeString()} ${nameSpaceString}>`,
			() => this.getRenderer().renderSvg(),
			'</svg>'
		);
	};

	static setRenderSize(width: number, height: number) {
		this.width = width;
		this.height = height;
		this.setSubSize();
	}

	static setSetting(setting: SvgSettingSvgurt | SvgSetting) {
		this.setting = this.adaptSetting(setting);
		this.setSubSetting(setting);
	}

	static setPixelRawData(pixelRawData: Uint8ClampedArray) {
		this.pixelRawData = pixelRawData;
		this.setSubPixelRawData();
	}

	private static getRenderer(): typeof RenderSvg {
		const { renderType } = this.setting;
		switch (renderType) {
			case 'CIRCLE':
				return CircleService;
			default:
				throw exhaustiveTypeCheck(renderType);
		}
	}

	private static setSubSetting(setting: SvgSettingSvgurt | SvgSetting) {
		const { renderType } = this.setting;
		switch (renderType) {
			case 'CIRCLE':
				CircleService.setCircleSetting(setting);
				return;
			default:
				throw exhaustiveTypeCheck(renderType);
		}
	}
	private static setSubSize() {
		const { renderType } = this.setting;
		switch (renderType) {
			case 'CIRCLE':
				CircleService.setSize(this.width, this.height);
				return;
			default:
				throw exhaustiveTypeCheck(renderType);
		}
	}

	private static setSubPixelRawData() {
		const { renderType } = this.setting;
		switch (renderType) {
			case 'CIRCLE':
				CircleService.setPixelRawData(this.pixelRawData);
				return;
			default:
				throw exhaustiveTypeCheck(renderType);
		}
	}

	private static getSizeString(): string {
		return `height="${this.height * this.setting.scale}" width="${this.width * this.setting.scale}"`;
	}

	private static adaptSetting(
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

	private static validateSvgSetting(
		setting: SvgSettingSvgurt | SvgSetting
	): setting is SvgSetting {
		return svgRendererSettingSchema.safeParse(setting).success;
	}
}
