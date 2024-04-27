import { create } from 'zustand';

export const ImageViewerState = {
	Default: 'Default',
	ElementLoaded: 'ElementLoaded',
	ImageLoaded: 'ImageLoaded',
} as const;

interface ImgViewerStore {
	imgViewer: null | HTMLImageElement;
	setImgViewer: (imgViewer: HTMLImageElement) => void;
	setImgSrc: (imgUrl: string) => void;
}

export const useImgViewerStore = create<ImgViewerStore>((set, get) => ({
	imgViewer: null,
	setImgViewer: (imgViewer: HTMLImageElement) => set(() => ({ imgViewer })),
	setImgSrc: (imgUrl: string) => {
		const imgViewer = get().imgViewer;
		if (!imgViewer) {
			return;
		}
		imgViewer.onload = () => {};
		imgViewer.onerror = () => {};
		imgViewer.src = imgUrl;
	},
}));
