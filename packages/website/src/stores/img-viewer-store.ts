import { create } from 'zustand';

interface ImgViewerStore {
	imgViewer: null | HTMLImageElement;
}

export const useImgViewerStore = create<ImgViewerStore>(set => ({
	imgViewer: null,
	setImgViewer: (imgViewer: HTMLImageElement) => set(() => ({ imgViewer })),
}));
