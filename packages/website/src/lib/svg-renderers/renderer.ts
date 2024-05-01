import { RenderSvg } from '@/lib/svg-renderers/bases';
import { CircleService } from '@/lib/svg-renderers/circle';
import { SvgRendererSetting } from '@/lib/svg-renderers/renderer-schema';
import { stringJoin, exhaustiveTypeCheck } from '@/lib/utils';

export class SvgRenderService {
	private static setting: SvgRendererSetting;
	private static width: number;
	private static height: number;

	static renderSvgString = () => {
		const nameSpaceString =
			'xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"';

		return stringJoin(
			`<svg ${this.getSizeString()} ${nameSpaceString}>`,
			() => this.getRenderer().renderSvg(),
			'</svg>'
		);
	};

	static setRenderSize(width: number, height: number) {
		this.width = width;
		this.height = height;
	}

	static setSetting(setting: SvgRendererSetting) {
		this.setting = setting;
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

	private static getSizeString(): string {
		return `height="${this.height * this.setting.scale}" width="${this.width * this.setting.scale}"`;
	}
}
