import { SvgViewerStore, useStore } from '@/stores/store';

export const useSvgViewerStore = () =>
	useStore<SvgViewerStore>(state => ({
		svgViewer: state.svgViewer,
		setSvgViewer: state.setSvgViewer,
		setSvg: state.setSvg,
		showSvg: state.showSvg,
	}));
