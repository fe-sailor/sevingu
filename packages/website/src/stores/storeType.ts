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
	svgRenderType: keyof typeof SVGRenderTypes;
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
}
export type PanelStateKey = keyof PanelState;
