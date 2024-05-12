import { useStore } from '@/stores/store';
import { ImageDataBlender } from '@/lib/canvas-blender/canvas-blender';

export type SvgViewerStore = {
	svgViewer: HTMLCanvasElement | null;
	svgImageBlender: ImageDataBlender | null;
	showSvg: () => void;
};

export const useSvgViewerStore = () =>
	useStore<SvgViewerStore>(state => ({
		svgViewer: state.svgViewer,
		svgImageBlender: state.svgImageBlender,
		showSvg: state.showSvg,
	}));
