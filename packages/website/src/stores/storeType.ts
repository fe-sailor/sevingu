export const SVGRenderTypes = {
	TRACE: 'TRACE',
	CIRCLE: 'CIRCLE',
	CURVE: 'CURVE',
	LINE: 'LINE',
	RECURSIVE: 'RECURSIVE',
	CONCENTRIC: 'CONCENTRIC',
} as const;

// export type SVGRenderTypes =
// 	| 'TRACE'
// 	| 'CIRCLE'
// 	| 'CURVE'
// 	| 'LINE'
// 	| 'RECURSIVE'
// 	| 'CONCENTRIC';

export interface PanelState {
	grayscale: boolean;
	invert: boolean;
	blur: number;
	posterize: boolean;
	posterizeLevels: number;
	edgeDetection: boolean;
	lowThreshold: number;
	highThreshold: number;
	//svg관련
	svgRenderType: keyof typeof SVGRenderTypes; // keyof typeof SVGRenderTypes
	minColorRecognized: number;
	maxColorRecognized: number;
	renderEveryXPixels: number;
	renderEveryYPixels: number;
	fill: boolean;
	fillColor: string;
	stroke: boolean;
	radius: number;
	radiusOnColor: boolean;
	radiusRandomness: number;
	// 커브에서 추가된것
	autoColor: boolean;
	strokeColor: string;
	strokeWidth: number;
	strokeWidthRandomness: number;
	amplitude: number;
	amplitudeRandomness: number;
	direction: number;
	directionRandomness: number;
	wavelength: number;
	wavelengthRandomness: number;
	waves: number;
	wavesRandomness: number;
	// 프렉탈
	applyFractalDisplacement: string;
}
export type PanelStateKey = keyof PanelState;
