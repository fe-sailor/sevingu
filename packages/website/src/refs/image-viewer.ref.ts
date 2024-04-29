import { create } from 'zustand';

export const ImageViewerState = {
	Default: 'Default',
	ElementLoaded: 'ElementLoaded',
	ImageLoaded: 'ImageLoaded',
} as const;

interface ImageViewerRef {
	imageViewer: null | HTMLCanvasElement;
	setImageViewer: (imageViewer: HTMLCanvasElement) => void;
	showImage: (imageBlob: Blob) => void;
}

export const useImageViewerRef = create<ImageViewerRef>((set, get) => ({
	imageViewer: null,
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

			renderOnViewer(reader.result, imageViewer);
		};

		reader.onerror = () => {};

		reader.readAsDataURL(imageBlob);
	},
}));

const renderOnViewer = (imageUri: string, canvasRef: HTMLCanvasElement) => {
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

		canvas2dContext.getImageData(0, 0, width, height);

		// TODO: image config 반영
		// ctx.putImageData(this.imageData, 0, 0);
	};

	htmlRenderedImage.src = imageUri;
};
