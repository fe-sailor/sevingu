// NOTE: static 매서드의 경우 implement가 제대로 안되어서 mixin으로 추가예정 > 안될 수도 있음
export abstract class RenderSvg {
	static renderSvg: () => string;
}
export abstract class SetSetting {
	static setSetting: (setting: object) => void;
}
export abstract class SetRenderSize {
	static setRenderSize: (width: number, height: number) => void;
}
export abstract class SetPixelRawData {
	static setPixelRawData: (pixelRawData: Uint8ClampedArray) => void;
}
