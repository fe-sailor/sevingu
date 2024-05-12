import { useStore } from '@/stores/store';
import { ImageDataBlender } from '@/lib/canvas-blender/canvas-blender';

export type SvgViewerStore = {
	svgViewer: HTMLCanvasElement | null;
	svgImageBlender: ImageDataBlender | null;
	isViewerInit: boolean;
	setIsViewerInit: (isViewerInit: boolean) => void;
	showSvg: () => void;
};

export const useSvgViewerStore = () =>
	useStore<SvgViewerStore>(state => ({
		svgViewer: state.svgViewer,
		svgImageBlender: state.svgImageBlender,
		isViewerInit: state.isViewerInit,
		setIsViewerInit: state.setIsViewerInit,
		showSvg: state.showSvg,
	}));
