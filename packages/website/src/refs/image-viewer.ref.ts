import { ImageViewerRef, useStore } from '@/stores/store';

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

export const useImageViewerRef = () =>
	useStore<ImageViewerRef>(state => ({
		imageViewer: state.imageViewer,
		imageConfig: state.imageConfig,
		htmlRenderedImage: state.htmlRenderedImage,
		imageUri: state.imageUri,
		setImageViewer: state.setImageViewer,
		showImage: state.showImage,
		updateConfig: state.updateConfig,
	}));
