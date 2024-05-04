import { create } from 'zustand';
import logo from '@/assets/sevingu_logo.png';
import * as StackBlur from 'stackblur-canvas';
import { SvgRenderService } from '@/lib/svg-renderers/svg-renderer';
import { getFileUri, getImageWidthAndHeight } from '@/lib/utils';

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

	showImage: async (imageBlob: Blob) => {
		const imagUri = await getFileUri(imageBlob);
		set(() => ({ imageUri: imagUri }));
		const imageViewer = get().imageViewer;

		if (!imageViewer) {
			console.error('image view empty');
			return;
		}

		renderOnViewer(
			get().htmlRenderedImage,
			imagUri,
			imageViewer,
			get().imageConfig
		);
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
		SvgRenderService.setPixelRawData(imageData.data);
		console.warn(SvgRenderService.renderSvg());
		svgViewer.innerHTML = SvgRenderService.renderSvg();
	},
}));

const renderOnViewer = async (
	htmlRenderedImage: HTMLImageElement,
	imageUri: string,
	canvasRef: HTMLCanvasElement,
	imageConfig: ImageConfiguration
) => {
	const { width, height, imageElement } =
		await getImageWidthAndHeight(imageUri);
	canvasRef.height = height;
	canvasRef.width = width;

	const canvas2dContext = canvasRef.getContext('2d', {
		// NOTE: canvas 성능향상을 위한 코드 임
		willReadFrequently: true,
	});
	if (!canvas2dContext) {
		console.error('canvas context empty');
		return;
	}
	canvas2dContext.drawImage(imageElement, 0, 0, width, height);
	const imageData = canvas2dContext.getImageData(0, 0, width, height);
	manipulateImageData(imageData, imageConfig, width, height);
	canvas2dContext.putImageData(imageData, 0, 0);
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
