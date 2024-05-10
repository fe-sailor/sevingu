import { CanvasFilter } from '@/lib/canvas-filter/canvas-filter';
import { SvgRenderer } from '@/lib/svg-renderers/svg-renderer';
import {
	SVG_RENDER_TYPES,
	SvgSettingSvgurt,
} from '@/lib/svg-renderers/svg-renderer-schema';
import { getFileUri, getImageWidthAndHeight, getSvgUrl } from '@/lib/utils';
import { create } from 'zustand';
import { ImageViewerStore } from './imageViewerStore';
import { MessageStore, SevinguMessage } from './messageStore';
import { SVGRenderTypes } from './storeType';
import { SvgViewerStore } from './svgViewerStore';
import { catchStoreError } from '@/stores/middleware';
import { ImageDataBlender } from '@/lib/canvas-blender/canvas-blender';
import { SVG_VIEWER_ID } from '@/components/dual-processed-image-viewer/const';

type Entries<T> = {
	[K in keyof T]: [K, T[K]];
}[keyof T];

export type PanelEntries = Entries<SvgSettingSvgurt>; // Entries<SvgRenderer>
export type SevinguImage = { imageBlob: Blob; setting: SvgSettingSvgurt };

// prettier-ignore
export type SevinguState =
  {
    undoRedoStack: SevinguImage[];

    /**undo, redo pointer index*/
    currentIndex: number;
    hasShownDefaultImage: boolean;
    getCurImage: () => SevinguImage | undefined;
    setCurImage: (imageUri: Blob, isUndoRedoAction?: boolean) => void;
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

export const useStore = create<SevinguState>(
	catchStoreError<SevinguState>(error => console.warn(error))((set, get) => ({
		undoRedoStack: [],
		currentIndex: -1,
		hasShownDefaultImage: true,
		getCurImage: () => {
			const idx = get().currentIndex;
			if (idx === -1) return;
			return get().undoRedoStack.at(idx);
		},

		setCurImage: (imageBlob, isUndoRedoAction) =>
			set(state => {
				if (isUndoRedoAction !== true) {
					const newStack = state.undoRedoStack.slice(0, state.currentIndex + 1);
					newStack.push({ imageBlob, setting: state.panelState });
					return {
						undoRedoStack: newStack,
						hasShownDefaultImage: false,
						currentIndex: state.currentIndex + 1,
					};
				}
				return { hasShownDefaultImage: false };
			}),

		undo: () => {
			if (get().hasShownDefaultImage) return;
			if (get().currentIndex === 0) {
				get().showDefaultImage();
				set(state => {
					return {
						hasShownDefaultImage: true,
						currentIndex: state.currentIndex - 1,
					};
				});
				return;
			}

			set(state => {
				return { currentIndex: state.currentIndex - 1 };
			});

			const imageObj = get().getCurImage();
			if (imageObj === undefined) {
				console.error('empty image object');
				return;
			}

			get().showImage(imageObj.imageBlob, true);
			console.log('execute redo');
		},

		redo: () => {
			if (get().undoRedoStack.length - 1 === get().currentIndex) return;

			set(state => {
				return { currentIndex: state.currentIndex + 1 };
			});

			const imageObj = get().getCurImage();
			if (imageObj === undefined) {
				console.error('empty image object');
				return;
			}
			get().showImage(imageObj.imageBlob, true);
			console.log('execute undo');
		},

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
		currentImageData: null,
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

		showImage: async (imageBlob: Blob, isUndoRedoAction) => {
			set(() => ({ imageBlob: imageBlob }));
			const imagUri = await getFileUri(imageBlob);
			get().setCurImage(imageBlob, isUndoRedoAction);
			set(() => ({ imageUri: imagUri }));
			get().sendMessage('SuccessToGetImageUri');
			const imageViewer = get().imageViewer;

			if (!imageViewer) {
				console.error('image view empty');
				return;
			}

			get().renderOnViewer(imagUri, imageViewer, 'SuccessToImageLoaded');
		},
		updateConfig: imageConfig => {
			const imageViewer = get().imageViewer;

			if (!imageViewer) {
				console.error('image view empty');
				return;
			}

			set(() => ({ imageConfig: imageConfig }));

			get().renderOnViewer(get().imageUri, imageViewer, 'SuccessToImageLoaded');
		},
		showDefaultImage: async () => {
			const imageViewer = get().imageViewer;

			if (!imageViewer) {
				console.error('image view empty');
				return;
			}

			get().renderOnViewer(
				get().defaultImageUri,
				imageViewer,
				'SuccessToImageLoaded'
			);
		},
		renderOnViewer: async (
			imageUri: string,
			canvasRef: HTMLCanvasElement,
			willSendSevinguMessage: keyof typeof SevinguMessage
		) => {
			const { width, height } = await getImageWidthAndHeight(imageUri);
			if (canvasRef.height !== height) {
				canvasRef.height = height;
			}
			if (canvasRef.width !== width) {
				canvasRef.width = width;
			}

			const canvas2dContext = canvasRef.getContext('2d', {
				// NOTE: canvas 성능향상을 위한 코드 임
				willReadFrequently: true,
			});
			if (!canvas2dContext) {
				console.error('canvas context empty');
				return;
			}
			const canvasFilter = new CanvasFilter(
				imageUri,
				canvas2dContext,
				willSendSevinguMessage === 'SuccessToSvgRendered'
					? {
							grayscale: false,
							invert: false,
							blur: 0,
							posterize: false,
							posterizeLevels: 5,
							edgeDetection: false,
							lowThreshold: 20,
							highThreshold: 50,
							postBlur: 0,
						}
					: {
							grayscale: false,
							invert: false,
							blur: 0,
							posterize: false,
							posterizeLevels: 5,
							edgeDetection: false,
							lowThreshold: 20,
							highThreshold: 50,
							postBlur: 1,
						}
			);

			if (!get().currentImageData) {
				set({
					currentImageData: await canvasFilter.renderImage(),
				});
				canvas2dContext.putImageData(get().currentImageData!, 0, 0);
				get().sendMessage(willSendSevinguMessage);
				return;
			}
			const imageDataFrom = get().currentImageData!;
			const imageDataTo = await canvasFilter.renderImage();
			new ImageDataBlender(SVG_VIEWER_ID, imageDataFrom, imageDataTo, 200);
			set({ currentImageData: imageDataTo });
		},

		/** SvgViewerStore */
		svgViewer: null,
		showSvg: async () => {
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

			const svgViewer = get().svgViewer;
			if (!svgViewer) {
				return;
			}

			get().renderOnViewer(
				getSvgUrl(renderer.renderSvg()),
				svgViewer,
				'SuccessToSvgRendered'
			);
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
			svgRenderType: SVGRenderTypes.CURVE, // SVG_RENDER_TYPES.enum.CIRCLE,
			minColorRecognized: 10,
			maxColorRecognized: 250,
			// TODO: 성능을 위해 최소값 설정 필요
			renderEveryXPixels: 6,
			renderEveryYPixels: 6,
			fill: true,
			fillColor: 'rgb(28,32,38)',
			stroke: true,
			radius: 2,
			radiusOnColor: true,
			radiusRandomness: 1,
			// 커브에서 추가된것
			autoColor: true,
			strokeColor: '',
			strokeWidth: 30,
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
	}))
);
