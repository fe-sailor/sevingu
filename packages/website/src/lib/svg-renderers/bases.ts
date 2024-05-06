import { SvgRenderer } from '@/lib/svg-renderers/svg-renderer';
import {
	SvgSetting,
	SvgSettingSvgurt,
} from '@/lib/svg-renderers/svg-renderer-schema';
// NOTE: static 매서드의 경우 implement가 제대로 안되어서 mixin으로 추가예정 > 안될 수도 있음
export interface RenderSvg {
	renderSvg: () => string;
}
export interface SetSetting {
	setSetting: (setting: SvgSettingSvgurt | SvgSetting) => RenderSvg;
}
export interface SetRenderSize {
	setRenderSize: (width: number, height: number) => RenderSvg;
}
export interface SetPixelRawData {
	setPixelRawData: (pixelRawData: Uint8ClampedArray) => RenderSvg;
}
