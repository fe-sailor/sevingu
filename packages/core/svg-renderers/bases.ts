import { SvgSetting, SvgSettingSvgurt } from './svg-renderer-schema';
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
