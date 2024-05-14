import { SevinguImage, useStore } from '@/stores/store';
import { SevinguMessage } from '@/stores/messageStore';

export type ImageConfiguration = { blur: number };

export type ImageViewerStore = {
	imageViewer: null | HTMLCanvasElement;
	imageConfig: ImageConfiguration;
	htmlRenderedImage: HTMLImageElement;
	imageUri: string;
	sevinguImage: SevinguImage | null;
	currentImageData: ImageData | null;
	setImageViewer: (imageViewer: HTMLCanvasElement) => void;
	showImage: (sevinguImage: SevinguImage, isUndoRedoAction?: boolean) => void;
	updateConfig: (imageConfig: ImageConfiguration) => void;
	showDefaultImage: () => void;
	renderOnViewer: (
		imageUri: string,
		canvasRef: HTMLCanvasElement,
		sevinguMessage: Extract<
			keyof typeof SevinguMessage,
			'SuccessToSvgRendered' | 'SuccessToImageLoaded'
		>
	) => void;
};

// NOTE: component 내에서 다음과 같이 사용하여 image config 가 canvas에 반영되도록 할 수 있음
// const { updateConfig } = useImageViewerStore();
// useEffect(
// 	() =>
// 		useImageViewerStore.subscribe(({ imageUri }) => {
// 			if (!imageUri) {
// 				return;
// 			}
// 			setTimeout(() => {
// 				updateConfig({ blur: 10 });
// 			}, 3000);
// 		}),
// 	[updateConfig]
// );

export const useImageViewerStore = () =>
	useStore<ImageViewerStore>(state => ({
		imageViewer: state.imageViewer,
		imageConfig: state.imageConfig,
		htmlRenderedImage: state.htmlRenderedImage,
		imageUri: state.imageUri,
		sevinguImage: state.sevinguImage,
		currentImageData: state.currentImageData,
		setImageViewer: state.setImageViewer,
		showImage: state.showImage,
		updateConfig: state.updateConfig,
		showDefaultImage: state.showDefaultImage,
		renderOnViewer: state.renderOnViewer,
	}));
