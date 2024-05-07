import { CanvasFilter } from '@/lib/canvas-filter/canvas-filter';
import { SvgRenderer } from '@/lib/svg-renderers/svg-renderer';
import {
	SvgSettingSvgurt,
	SVG_RENDER_TYPES,
} from '@/lib/svg-renderers/svg-renderer-schema';
import { getFileUri, getImageWidthAndHeight } from '@/lib/utils';
import { create } from 'zustand';
import { ImageViewerStore } from './image-viewer.store';
import { MessageStore, SevinguMessage } from './message.store';
import { PanelState, PanelStateKey, SVGRenderTypes } from './storeType';
import { SvgViewerStore } from './svg-viewer.store';

type Entries<T> = {
	[K in keyof T]: [K, T[K]];
}[keyof T];

export type svgControlValue = Entries<SvgSettingSvgurt>; // Entries<SvgRenderer>

// prettier-ignore
export type SevinguState =
  {
    curImage: string;
    pastImages: string[];
    futureImages: string[];
    setCurImage: (img: string) => void;
    undo: () => void;
    redo: () => void;
    download: () => void;
    /** controller 관련 */
    panelState: SvgSettingSvgurt; // PanelState; // SvgRenderer
    changePanelState:  (
			[PanelStateKey, PanelEntries]
        // key: PanelStateKey, // keyof SvgRenderer,
        // value: PanelEntries // boolean | number | string | keyof typeof SVGRenderTypes
      ) => void;
  }
  & ImageViewerStore
  & SvgViewerStore
  & MessageStore;

const svgSetting: SvgSettingSvgurt = {
	scale: 1,
	svgRenderType: SVG_RENDER_TYPES.Enum.CURVE,
	applyFractalDisplacement: '',
	fill: true,
	fillColor: '#000000',
	stroke: true,
	autoColor: true,
	radius: 1,
	radiusOnColor: true,
	radiusRandomness: 1,
	strokeColor: '',
	strokeWidth: 1,
	strokeWidthRandomness: 1,
	renderEveryXPixels: 10,
	renderEveryYPixels: 10,
	minColorRecognized: 1,
	maxColorRecognized: 256,
	amplitude: 1,
	amplitudeRandomness: 1,
	direction: 1,
	directionRandomness: 1,
	wavelength: 1,
	wavelengthRandomness: 1,
	waves: 1,
	wavesRandomness: 1,
};

export const useStore = create<SevinguState>((set, get) => ({
	curImage: '',
	pastImages: [],
	futureImages: [],
	setCurImage: img =>
		set(state => {
			const newPastImages = state.curImage
				? [...state.pastImages, state.curImage]
				: [...state.pastImages];
			return {
				...state,
				curImage: img,
				pastImages: newPastImages,
				futureImages: [],
			};
		}),
	undo: () =>
		set(state => {
			if (state.pastImages.length === 0) return state;

			const prevImage = state.pastImages[state.pastImages.length - 1];
			const newPastImages = state.pastImages.slice(0, -1);
			const newFutureImages = state.curImage
				? [state.curImage, ...state.futureImages]
				: [...state.futureImages];

			return {
				...state,
				curImage: prevImage,
				pastImages: newPastImages,
				futureImages: newFutureImages,
			};
		}),
	redo: () =>
		set(state => {
			if (state.futureImages.length === 0) return state;

			const nextImage = state.futureImages[0];
			const newFutureImages = state.futureImages.slice(1);
			const newPastImages = state.curImage
				? [...state.pastImages, state.curImage]
				: [...state.pastImages];

			return {
				...state,
				curImage: nextImage,
				pastImages: newPastImages,
				futureImages: newFutureImages,
			};
		}),

	download: () => {
		// 사용자에게 파일 이름 입력받기
		const fileName = prompt(
			'다운로드할 SVG 파일의 이름을 입력하세요.',
			'downloaded_svg.svg'
		);
		// 사용자가 취소를 누른 경우
		if (fileName === null) {
			console.log('다운로드 취소됨.');
			return;
		}

		console.log('download complete.');
		const linkElement = document.createElement('a');
		linkElement.download = fileName; // 입력받은 파일 이름 사용
		const svgViewer = get().svgViewer;
		if (!svgViewer) {
			return;
		}
		const svgData = new XMLSerializer().serializeToString(svgViewer);
		const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
		linkElement.href = URL.createObjectURL(blob);
		linkElement.style.display = 'none';

		document.body.appendChild(linkElement);
		linkElement.click();
		document.body.removeChild(linkElement);
	},

	/** ImageViewerStore */
	imageViewer: null,
	imageConfig: { blur: 20 },
	htmlRenderedImage: new Image(),
	imageUri: '',
	defaultImageUri: '/sample_image.jpg',
	imageBlob: null,
	setImageViewer: (imageViewer: HTMLCanvasElement) => {
		const prevViewer = get().imageViewer;

		set(() => {
			if (get().imageViewer === imageViewer) {
				return { imageViewer: get().imageViewer };
			}
			return { imageViewer };
		});

		if (!prevViewer) {
			get().sendMessage('SetImageViewerFirstTime');
		}
	},

	showImage: async (imageBlob: Blob) => {
		set(() => ({ imageBlob: imageBlob }));
		const imagUri = await getFileUri(imageBlob);
		set(() => ({ imageUri: imagUri }));
		get().sendMessage('SuccessToGetImageUri');
		const imageViewer = get().imageViewer;

		if (!imageViewer) {
			console.error('image view empty');
			return;
		}

		get().renderOnViewer(imagUri, imageViewer);
	},
	updateConfig: imageConfig => {
		const imageViewer = get().imageViewer;

		if (!imageViewer) {
			console.error('image view empty');
			return;
		}

		set(() => ({ imageConfig: imageConfig }));

		get().renderOnViewer(get().imageUri, imageViewer);
	},
	showDefaultImage: async () => {
		const imageViewer = get().imageViewer;

		if (!imageViewer) {
			console.error('image view empty');
			return;
		}

		get().renderOnViewer(get().defaultImageUri, imageViewer);
	},
	renderOnViewer: async (imageUri: string, canvasRef: HTMLCanvasElement) => {
		const { width, height } = await getImageWidthAndHeight(imageUri);
		canvasRef.height = height;
		canvasRef.width = width;

		const canvas2dContext = canvasRef.getContext('2d', {
			// NOTE: canvas 성능향상을 위한 코드 임
			willReadFrequently: true,
		});
		if (!canvas2dContext) {
			console.error('canvas context empty');
			return;
		}
		const canvasFilter = new CanvasFilter(imageUri, canvas2dContext, {
			grayscale: false,
			invert: false,
			blur: 0,
			posterize: false,
			posterizeLevels: 5,
			edgeDetection: false,
			lowThreshold: 20,
			highThreshold: 50,
			postBlur: 1,
		});
		const imageData = await canvasFilter.renderImage();

		canvas2dContext.putImageData(imageData, 0, 0);
		get().sendMessage('SuccessToImageLoaded');
	},

	/** SvgViewerStore */
	svgViewer: null,
	setSvgViewer: (svgViewer: HTMLDivElement) => set(() => ({ svgViewer })),
	showSvg: () => {
		const canvasRef = get().imageViewer;
		if (!canvasRef) {
			return;
		}
		const canvas2dContext = canvasRef.getContext('2d', {
			willReadFrequently: true,
		});
		if (!canvas2dContext) {
			console.error('canvas context empty');
			return;
		}
		const imageData = canvas2dContext.getImageData(
			0,
			0,
			canvasRef.width,
			canvasRef.height
		);
		const svgViewer = get().svgViewer;
		if (!svgViewer) {
			return;
		}

		const panelState = get().panelState;
		const renderer = new SvgRenderer(
			{
				...panelState,
				scale: 1,
				svgRenderType: SVG_RENDER_TYPES.enum.CURVE,
				// applyFractalDisplacement: '',
				// fill: true,
				// fillColor: '#000000',
				// stroke: true,
				// autoColor: true,
				// radius: 1,
				// radiusOnColor: true,
				// radiusRandomness: 1,
				// strokeColor: '',
				// strokeWidth: 20,
				// strokeWidthRandomness: 1,
				// renderEveryXPixels: 10,
				// renderEveryYPixels: 10,
				// minColorRecognized: 1,
				// maxColorRecognized: 256,
				// amplitude: 20,
				// amplitudeRandomness: 1,
				// direction: 1,
				// directionRandomness: 1,
				// wavelength: 10,
				// wavelengthRandomness: 1,
				// waves: 5,
				// wavesRandomness: 1,
			},
			canvasRef.width,
			canvasRef.height,
			imageData.data
		);

		console.warn(renderer.renderSvg());
		svgViewer.innerHTML = renderer.renderSvg();
	},

	/** controller 관련 */
	panelState: {
		// grayscale: false,
		// invert: false,
		// blur: 0,
		// posterize: false,
		// posterizeLevels: 5,
		// edgeDetection: false,
		// lowThreshold: 20,
		// highThreshold: 50,
		//svg관련
		scale: 1,
		svgRenderType: SVGRenderTypes.CIRCLE, // SVG_RENDER_TYPES.enum.CIRCLE,
		minColorRecognized: 50,
		maxColorRecognized: 200,
		renderEveryXPixels: 6,
		renderEveryYPixels: 6,
		fill: true,
		fillColor: 'rgb(28,32,38)',
		stroke: false,
		radius: 4,
		radiusOnColor: true,
		radiusRandomness: 0.2,
		// 커브에서 추가된것
		autoColor: true,
		strokeColor: '',
		strokeWidth: 20,
		strokeWidthRandomness: 1,
		amplitude: 20,
		amplitudeRandomness: 1,
		direction: 1,
		directionRandomness: 1,
		wavelength: 10,
		wavelengthRandomness: 1,
		waves: 5,
		wavesRandomness: 1,
		// 프렉탈
		applyFractalDisplacement: '',
	},
	changePanelState: ([key, value]) => {
		set(state => ({
			...state,
			panelState: {
				...state.panelState,
				[key]: value,
			},
		}));
		get().sendMessage('ChangeSvgSetting');
	},

	/** MessageStore */
	message: SevinguMessage.Default,
	setMessage: message => set(() => ({ message: message })),
	resetMessage: () => set(() => ({ message: SevinguMessage.Default })),
	sendMessage: message => {
		get().setMessage(message);
		get().resetMessage();
	},
}));
