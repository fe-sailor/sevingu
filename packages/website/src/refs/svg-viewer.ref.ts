import { create } from 'zustand';

interface SvgViewerRef {
	svgViewer: null | HTMLDivElement;
	setSvgViewer: (svgViewer: HTMLDivElement) => void;
	setSvg: (svgAsString: string) => void;
}

export const useSvgViewerRef = create<SvgViewerRef>((set, get) => ({
	svgViewer: null,
	setSvgViewer: (svgViewer: HTMLDivElement) => set(() => ({ svgViewer })),
	setSvg: (svgAsString: string) => {
		const svgViewer = get().svgViewer;
		if (!svgViewer) {
			return;
		}
		svgViewer.innerHTML = svgAsString;
	},
}));
