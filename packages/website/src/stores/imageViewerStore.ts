import { useStore } from '@/stores/store';

export type ImageConfiguration = { blur: number };

export type ImageViewerStore = {
	imageViewer: null | HTMLCanvasElement;
	imageConfig: ImageConfiguration;
	htmlRenderedImage: HTMLImageElement;
	imageUri: string;
	defaultImageUri: string;
	imageBlob: Blob | null;
	setImageViewer: (imageViewer: HTMLCanvasElement) => void;
	showImage: (imageBlob: Blob) => void;
	updateConfig: (imageConfig: ImageConfiguration) => void;
	showDefaultImage: () => void;
	renderOnViewer: (imageUri: string, canvasRef: HTMLCanvasElement) => void;
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
		defaultImageUri: state.defaultImageUri,
		imageBlob: state.imageBlob,
		setImageViewer: state.setImageViewer,
		showImage: state.showImage,
		updateConfig: state.updateConfig,
		showDefaultImage: state.showDefaultImage,
		renderOnViewer: state.renderOnViewer,
	}));
