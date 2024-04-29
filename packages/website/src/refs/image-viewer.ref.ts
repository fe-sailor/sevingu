import { create } from 'zustand';
import * as StackBlur from 'stackblur-canvas';

export const ImageViewerState = {
	Default: 'Default',
	ElementLoaded: 'ElementLoaded',
	ImageLoaded: 'ImageLoaded',
} as const;

export type ImageConfiguration = { blur: number };

interface ImageViewerRef {
	imageViewer: null | HTMLCanvasElement;
	imageConfig: ImageConfiguration;
	setImageViewer: (imageViewer: HTMLCanvasElement) => void;
	showImage: (imageBlob: Blob) => void;
}

export const useImageViewerRef = create<ImageViewerRef>((set, get) => ({
	imageViewer: null,
	imageConfig: { blur: 20 },
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

			if (typeof reader.result !== 'string') {
				console.error('image data uri is not string');
				return;
			}

			renderOnViewer(reader.result, imageViewer, get().imageConfig);
		};

		reader.onerror = () => {};

		reader.readAsDataURL(imageBlob);
	},
}));

const renderOnViewer = (
	imageUri: string,
	canvasRef: HTMLCanvasElement,
	imageConfig: ImageConfiguration
) => {
	const htmlRenderedImage = new Image();

	htmlRenderedImage.onload = () => {
		const height = (canvasRef.height = htmlRenderedImage.height);
		const width = (canvasRef.width = htmlRenderedImage.width);

		const canvas2dContext = canvasRef.getContext('2d');
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
