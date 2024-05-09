import { useStore } from '@/stores/store';

export type SvgViewerStore = {
	svgViewer: HTMLCanvasElement | null;
	showSvg: () => void;
};

export const useSvgViewerStore = () =>
	useStore<SvgViewerStore>(state => ({
		svgViewer: state.svgViewer,
		showSvg: state.showSvg,
	}));
