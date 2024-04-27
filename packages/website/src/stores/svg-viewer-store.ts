import { create } from 'zustand';

interface SvgViewerStore {
	svgViewer: null | HTMLDivElement;
	setSvgViewer: (svgViewer: HTMLDivElement) => void;
}

export const useSvgViewerStore = create<SvgViewerStore>(set => ({
	svgViewer: null,
	setSvgViewer: (svgViewer: HTMLDivElement) => set(() => ({ svgViewer })),
}));
