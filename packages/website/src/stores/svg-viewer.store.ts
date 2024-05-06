import { useStore } from '@/stores/store';

export type SvgViewerStore = {
	svgViewer: null | HTMLDivElement;
	setSvgViewer: (svgViewer: HTMLDivElement) => void;
	setSvg: (svgAsString: string) => void;
	showSvg: () => void;
};

export const useSvgViewerStore = () =>
	useStore<SvgViewerStore>(state => ({
		svgViewer: state.svgViewer,
		setSvgViewer: state.setSvgViewer,
		setSvg: state.setSvg,
		showSvg: state.showSvg,
	}));
