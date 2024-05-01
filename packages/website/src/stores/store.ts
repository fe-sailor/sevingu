import { create } from 'zustand';
import logo from '@/assets/sevingu_logo.png';
import * as StackBlur from 'stackblur-canvas';
import { SvgRenderService } from '@/lib/svg-renderers/renderer';

export type ImageConfiguration = { blur: number };

export type ImageViewerRef = {
	imageViewer: null | HTMLCanvasElement;
	imageConfig: ImageConfiguration;
	htmlRenderedImage: HTMLImageElement;
	imageUri: string;
	setImageViewer: (imageViewer: HTMLCanvasElement) => void;
	showImage: (imageBlob: Blob) => void;
	updateConfig: (imageConfig: ImageConfiguration) => void;
};

export type SvgViewerRef = {
	svgViewer: null | HTMLDivElement;
	setSvgViewer: (svgViewer: HTMLDivElement) => void;
	setSvg: (svgAsString: string) => void;
	showSvg: () => void;
};

type SevinguState = {
	curImage: string;
	pastImages: string[];
	futureImages: string[];
	setCurImage: (img: string) => void;
	undo: () => void;
	redo: () => void;
} & ImageViewerRef &
	SvgViewerRef;

const SVG_RENDER_TYPES = { CIRCLE: 'CIRCLE' } as const;

const svgSetting: SvgSettingSvgurt = {
	scale: 1,
	svgRenderType: SVG_RENDER_TYPES.CIRCLE,
	applyFractalDisplacement: '',
	fill: true,
	fillColor: '#000000',
	stroke: true,
	autoColor: true,
	radius: 1,
	radiusOnColor: true,
	radiusRandomness: 1,
	strokeColor: '',
	strokeWidth: 1,
	strokeWidthRandomness: 1,
	renderEveryXPixels: 10,
	renderEveryYPixels: 10,
	minColorRecognized: 1,
	maxColorRecognized: 256,
};
export const useStore = create<SevinguState>((set, get) => ({
	curImage: logo,
	pastImages: [],
	futureImages: [],
	setCurImage: img =>
		set(state => {
			const newPastImages = state.curImage
				? [...state.pastImages, state.curImage]
				: [...state.pastImages];
			return {
				...state,
				curImage: img,
				pastImages: newPastImages,
				futureImages: [],
			};
		}),
	undo: () =>
		set(state => {
			if (state.pastImages.length === 0) return state;

			const prevImage = state.pastImages[state.pastImages.length - 1];
			const newPastImages = state.pastImages.slice(0, -1);
			const newFutureImages = state.curImage
				? [state.curImage, ...state.futureImages]
				: [...state.futureImages];

			return {
				...state,
				curImage: prevImage,
				pastImages: newPastImages,
				futureImages: newFutureImages,
			};
		}),
	redo: () =>
		set(state => {
			if (state.futureImages.length === 0) return state;

			const nextImage = state.futureImages[0];
			const newFutureImages = state.futureImages.slice(1);
			const newPastImages = state.curImage
				? [...state.pastImages, state.curImage]
				: [...state.pastImages];

			return {
				...state,
				curImage: nextImage,
				pastImages: newPastImages,
				futureImages: newFutureImages,
			};
		}),

	imageViewer: null,
	imageConfig: { blur: 20 },
	htmlRenderedImage: new Image(),
	imageUri: '',
	setImageViewer: (imageViewer: HTMLCanvasElement) =>
		set(() => {
			if (get().imageViewer === imageViewer) {
				return { imageViewer: get().imageViewer };
			}
			return { imageViewer };
		}),

	showImage: (imageBlob: Blob) => {
		const reader = new FileReader();
		reader.onloadend = () => {
			const imageViewer = get().imageViewer;

			if (!imageViewer) {
				console.error('image view empty');
				return;
			}

			const imagUri = reader.result;

			if (typeof imagUri !== 'string') {
				console.error('image data uri is not string');
				return;
			}

			set(() => ({ imageUri: imagUri }));

			renderOnViewer(
				get().htmlRenderedImage,
				imagUri,
				imageViewer,
				get().imageConfig
			);
		};

		reader.onerror = () => {};

		reader.readAsDataURL(imageBlob);
	},
	updateConfig: imageConfig => {
		const imageViewer = get().imageViewer;

		if (!imageViewer) {
			console.error('image view empty');
			return;
		}

		set(() => ({ imageConfig: imageConfig }));

		renderOnViewer(
			get().htmlRenderedImage,
			get().imageUri,
			imageViewer,
			imageConfig
		);
	},
	svgViewer: null,
	setSvgViewer: (svgViewer: HTMLDivElement) => set(() => ({ svgViewer })),
	setSvg: (svgAsString: string) => {
		const svgViewer = get().svgViewer;
		if (!svgViewer) {
			return;
		}
		svgViewer.innerHTML = svgAsString;
	},
	showSvg: () => {
		const canvasRef = get().imageViewer;
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
		const svgViewer = get().svgViewer;
		if (!svgViewer) {
			return;
		}

		SvgRenderService.setSetting(svgSetting);
		SvgRenderService.setRenderSize(canvasRef.width, canvasRef.height);
		console.warn(SvgRenderService.renderSvgString());

		renderSvgString(
			imageData.data,
			canvasRef,
			svgSetting,
			canvasRef.width,
			canvasRef.height
		).then(svg => (svgViewer.innerHTML = svg));
	},
}));

const renderOnViewer = (
	htmlRenderedImage: HTMLImageElement,
	imageUri: string,
	canvasRef: HTMLCanvasElement,
	imageConfig: ImageConfiguration
) => {
	htmlRenderedImage.onload = () => {
		const height = (canvasRef.height = htmlRenderedImage.height);
		const width = (canvasRef.width = htmlRenderedImage.width);

		const canvas2dContext = canvasRef.getContext('2d', {
			// NOTE: canvas 성능향상을 위한 코드 임
			willReadFrequently: true,
		});

		if (!canvas2dContext) {
			console.error('canvas context empty');
			return;
		}
		canvas2dContext.drawImage(htmlRenderedImage, 0, 0, width, height);

		const imageData = canvas2dContext.getImageData(0, 0, width, height);

		manipulateImageData(imageData, imageConfig, width, height);

		canvas2dContext.putImageData(imageData, 0, 0);
	};

	htmlRenderedImage.src = imageUri;
};

const manipulateImageData = (
	imageData: ImageData,
	imageConfig: ImageConfiguration,
	width: number,
	height: number
) => {
	// if (imageSettings.grayscale) {
	// 	grayScale(imageData, width, height);
	// }

	// if (imageSettings.invert) {
	// 	invertImage(imageData);
	// }

	if (imageConfig.blur && imageConfig.blur > 0) {
		blurImage(imageData, imageConfig.blur, width, height);
	}

	// if (imageSettings.posterize) {
	// 	posterizeImage(imageData, imageSettings.posterizeLevels);
	// }

	// if (imageSettings['Edge Detection']) {
	// 	cannyEdgeDetection(
	// 		imageData,
	// 		imageSettings.lowThreshold,
	// 		imageSettings.highThreshold,
	// 		width,
	// 		height
	// 	);
	// }

	// if (imageSettings.applyFractalField) {
	// 	fractalField(imageData, imageSettings, width);
	// }

	// if (imageSettings.postBlur && imageSettings.postBlur > 0) {
	// 	blurImage(imageData, imageSettings.postBlur, width, height);
	// }
};

const blurImage = (
	imageData: ImageData,
	blur: number,
	width: number,
	height: number
) => {
	StackBlur.imageDataRGB(imageData, 0, 0, width, height, Math.floor(blur));
};

export type SvgSettingSvgurt = {
	scale: number;
	fill: boolean;
	fillColor: string;
	stroke: boolean;
	svgRenderType: keyof typeof SVG_RENDER_TYPES;
	autoColor: boolean;
	applyFractalDisplacement: string;
	radius: number;
	radiusOnColor: boolean;
	radiusRandomness: number;
	strokeColor: string;
	strokeWidth: number;
	strokeWidthRandomness: number;
	renderEveryXPixels: number;
	renderEveryYPixels: number;
	minColorRecognized: number;
	maxColorRecognized: number;
};

export type Circle = {
	x: number;
	y: number;
	r: number;
	strokeColor: string;
	strokeWidth: number;
};

export type Pixel = {
	r: number;
	g: number;
	b: number;
};

async function renderSvgString(
	clampedArray: Uint8ClampedArray,
	canvasRef: HTMLCanvasElement,
	svgSettings: SvgSettingSvgurt,
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

export function renderCircles(
	svgSettings: SvgSettingSvgurt,
	circles: Circle[]
) {
	const { fill, fillColor, scale, stroke } = svgSettings;

	let renderString = '';
	let i = 0;
	for (i = 0; i < circles.length; i++) {
		const { x, y, r, strokeWidth, strokeColor } = circles[i];
		renderString += `<circle cx="${x * scale}" cy="${
			y * scale
		}" r="${r * scale}" style="stroke: ${
			stroke ? strokeColor : 'none'
		}; stroke-width: ${strokeWidth}; fill: ${fill ? fillColor : 'none'};" />`;
	}

	return renderString;
}

function createCircleAtPoint(
	baseX: number,
	baseY: number,
	settings: SvgSettingSvgurt,
	pixel: Pixel
) {
	const {
		autoColor,
		applyFractalDisplacement,
		radius,
		radiusOnColor,
		radiusRandomness,
		strokeColor,
		strokeWidth,
		strokeWidthRandomness,
	} = settings;

	const x = baseX;
	const y = baseY;

	let circleRadius = radius;
	if (radiusOnColor) {
		circleRadius = getPixelColorIntensity(pixel, settings) * radius;
	}

	circleRadius *= 1 - Math.random() * radiusRandomness;

	const circleColor = autoColor
		? `rgb(${pixel.r}, ${pixel.g}, ${pixel.b})`
		: strokeColor;

	const circle = {
		x,
		y,
		r: circleRadius,
		strokeColor: circleColor,
		strokeWidth: strokeWidth * (1 - Math.random() * strokeWidthRandomness),
	};

	return circle;
}

export function createCircles(
	settings: SvgSettingSvgurt,
	imageData: Uint8ClampedArray,
	width: number,
	height: number
) {
	const { renderEveryXPixels, renderEveryYPixels } = settings;

	const circles = [];
	for (let x = 0; x < width; x += renderEveryXPixels) {
		for (let y = 0; y < height; y += renderEveryYPixels) {
			const pixelColor = getPixelColorAtXY(imageData, x, y, width);
			if (!isInColorThreshhold(pixelColor, settings)) {
				continue;
			}

			circles.push(createCircleAtPoint(x, y, settings, pixelColor));
		}
	}
	return circles;
}
export function getPixelColorAtDataIndex(
	imageData: Uint8ClampedArray,
	dataIndex: number
) {
	return {
		r: imageData[dataIndex],
		g: imageData[dataIndex + 1],
		b: imageData[dataIndex + 2],
		a: imageData[dataIndex + 3] / 255,
	};
}

export function getPixelColorAtXY(
	imageData: Uint8ClampedArray,
	x: number,
	y: number,
	width: number
) {
	const dataIndex = (Math.round(x) + Math.round(y) * width) * 4;

	return getPixelColorAtDataIndex(imageData, dataIndex);
}

export function isInColorThreshhold(pixel: Pixel, settings: SvgSettingSvgurt) {
	const { minColorRecognized, maxColorRecognized } = settings;

	return (
		pixel.r >= minColorRecognized &&
		pixel.g >= minColorRecognized &&
		pixel.b >= minColorRecognized &&
		pixel.r <= maxColorRecognized &&
		pixel.g <= maxColorRecognized &&
		pixel.b <= maxColorRecognized
	);
}

export function getPixelColorIntensity(
	pixel: Pixel,
	settings: SvgSettingSvgurt
) {
	const { minColorRecognized, maxColorRecognized } = settings;

	const r = pixel.r - minColorRecognized;
	const g = pixel.g - minColorRecognized;
	const b = pixel.b - minColorRecognized;
	const colorSum = Math.max(1, r + g + b);

	const outOf = Math.max(1, Math.abs(maxColorRecognized - minColorRecognized));

	return colorSum / 3 / outOf;
}
