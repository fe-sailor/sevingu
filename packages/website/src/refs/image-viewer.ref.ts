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
	htmlRenderedImage: HTMLImageElement;
	imageUri: string;
	setImageViewer: (imageViewer: HTMLCanvasElement) => void;
	showImage: (imageBlob: Blob) => void;
	updateConfig: (imageConfig: ImageConfiguration) => void;
}

// NOTE: component 내에서 다음과 같이 사용하여 image config 가 canvas에 반영되도록 할 수 있음
// const { updateConfig } = useImageViewerRef();
// useEffect(
// 	() =>
// 		useImageViewerRef.subscribe(({ imageUri }) => {
// 			if (!imageUri) {
// 				return;
// 			}
// 			setTimeout(() => {
// 				updateConfig({ blur: 10 });
// 			}, 3000);
// 		}),
// 	[updateConfig]
// );

export const useImageViewerRef = create<ImageViewerRef>((set, get) => ({
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
