import { SvgViewerRef, useStore } from '@/stores/store';

export const useSvgViewerRef = () =>
	useStore<SvgViewerRef>(state => ({
		svgViewer: state.svgViewer,
		setSvgViewer: state.setSvgViewer,
		setSvg: state.setSvg,
		showSvg: state.showSvg,
	}));
