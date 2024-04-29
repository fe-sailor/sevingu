import { create } from 'zustand';

interface SvgViewerRef {
	svgViewer: null | HTMLDivElement;
	canvasRef: null | HTMLCanvasElement;
	setSvgViewer: (svgViewer: HTMLDivElement) => void;
	setSvg: (svgAsString: string) => void;
	setCanvasRef: (canvasRef: HTMLCanvasElement) => void;
	showSvg: () => void;
}

const SVG_RENDER_TYPES = { CIRCLE: 'CIRCLE' } as const;

export const useSvgViewerRef = create<SvgViewerRef>((set, get) => ({
	svgViewer: null,
	canvasRef: null,
	setSvgViewer: (svgViewer: HTMLDivElement) => set(() => ({ svgViewer })),
	setSvg: (svgAsString: string) => {
		const svgViewer = get().svgViewer;
		if (!svgViewer) {
			return;
		}
		svgViewer.innerHTML = svgAsString;
	},
	setCanvasRef: (canvasRef: HTMLCanvasElement) => set(() => ({ canvasRef })),
	showSvg: () => {
		const canvasRef = get().canvasRef;
		if (!canvasRef) {
			return;
		}
		const canvas2dContext = canvasRef.getContext('2d', {
			willReadFrequently: true,
		});
		if (!canvas2dContext) {
			console.error('canvas context empty');
			return;
		}
		const imageData = canvas2dContext.getImageData(
			0,
			0,
			canvasRef.width,
			canvasRef.height
		);
		renderSvgString(
			imageData.data,
			canvasRef,
			{
				scale: 1,
				svgRenderType: SVG_RENDER_TYPES.CIRCLE,
			},
			canvasRef.width,
			canvasRef.height
		);
	},
}));

async function renderSvgString(
	clampedArray: Uint8ClampedArray,
	canvasRef: HTMLCanvasElement,
	svgSettings: { scale: number; svgRenderType: keyof typeof SVG_RENDER_TYPES },
	width: number,
	height: number
) {
	const { scale } = svgSettings;

	// TODO: Figure out why we delay here.
	await new Promise(resolve => setTimeout(resolve));

	const dimensionsString = `height="${height * scale}" width="${
		width * scale
	}"`;

	const nameSpaceString =
		'xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"';
	let svgString = `<svg ${dimensionsString} ${nameSpaceString}>`;

	// eslint-disable-next-line default-case
	switch (svgSettings.svgRenderType) {
		case SVG_RENDER_TYPES.CIRCLE: {
			const circles = createCircles(svgSettings, clampedArray, width, height);
			svgString += renderCircles(svgSettings, circles);
			break;
		}
		// case SVG_RENDER_TYPES.CURVE: {
		// 	const curves = createCurves(svgSettings, clampedArray, width, height);

		// 	svgString += renderCurves(svgSettings, curves);
		// 	break;
		// }
		// case SVG_RENDER_TYPES.LINE: {
		// 	const lines = createLines(svgSettings, clampedArray, width, height);

		// 	svgString += renderLines(svgSettings, lines);
		// 	break;
		// }
		// case SVG_RENDER_TYPES.RECURSIVE: {
		// 	const lines = createRecursivePaths(
		// 		svgSettings,
		// 		clampedArray,
		// 		width,
		// 		height
		// 	);

		// 	svgString += renderPaths(svgSettings, lines);
		// 	break;
		// }
		// case SVG_RENDER_TYPES.TRACE: {
		// 	if (!canvas) {
		// 		// eslint-disable-next-line max-len
		// 		throw new Error(
		// 			'Unfortunately, we only support the TRACE configuration in the browser, since it reads data from html canvas. This is on our roadmap to add. Feel free to make a github issue about it to get us moving on it.'
		// 		);
		// 	}

		// 	const paths = potrace.getPaths(
		// 		potrace.traceCanvas(canvas, {
		// 			turdsize: svgSettings.noiseSize,
		// 		})
		// 	);

		// 	svgString += renderPotracePaths(svgSettings, paths);
		// 	break;
		// }
		// case SVG_RENDER_TYPES.CONCENTRIC: {
		// 	const concentricPaths = createConcentricPaths(
		// 		svgSettings,
		// 		imageData,
		// 		width,
		// 		height
		// 	);

		// 	svgString += renderConcentricPaths(
		// 		svgSettings,
		// 		concentricPaths,
		// 		width / 2,
		// 		height / 2
		// 	);
		// }
	}

	svgString += '</svg>';

	return svgString;
}
