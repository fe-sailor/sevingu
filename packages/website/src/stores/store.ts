import { PanelType } from '@/components/panel/panel';
import {
	PushMessage,
	PushMessageStore,
} from '@/components/push-alert/PushAlert';
import { DEFAULT_IMAGE_URI } from '@/constants';
import { CanvasFilter } from '@/lib/canvas-filter/canvas-filter';
import { CanvasSettingSvgurt } from '@/lib/canvas-filter/canvas-filter-schema';
import { SvgRenderer } from '@/lib/svg-renderers/svg-renderer';
import {
	SVG_RENDER_TYPES,
	SvgSettingSvgurt,
} from '@/lib/svg-renderers/svg-renderer-schema';
import { getFileUri, getImageWidthAndHeight, getSvgUrl } from '@/lib/utils';
import { catchStoreError } from '@/stores/middleware';
import { debounce } from 'lodash';
import { create } from 'zustand';
import { ImageViewerStore } from './imageViewerStore';
import { MessageStore, SevinguMessage } from './messageStore';
import { SvgViewerStore } from './svgViewerStore';

type Entries<T> = {
	[K in keyof T]: [K, T[K]];
}[keyof T];

export type PanelEntries = Entries<SvgSettingSvgurt>; // Entries<SvgRenderer>
export type SevinguImage = {
	imageBlob: Blob;
	setting?: SvgSettingSvgurt;
	timeStamp?: number;
};

// prettier-ignore
export type SevinguState =
  {
    undoRedoStack: SevinguImage[];

    /**undo, redo pointer index*/
    currentIndex: number;
    hasShownDefaultImage: boolean;
    getCurImage: () => SevinguImage | undefined;
    setCurImage: (sevinguImage: SevinguImage, isUndoRedoAction?: boolean) => void;
    undo: () => void;
    redo: () => void;
    download: () => void;

    /** controller 관련 */
		imagePanelState: CanvasSettingSvgurt;
    svgPanelState: SvgSettingSvgurt; // PanelState; // SvgRenderer
		changePanelState:  (
			panelType: PanelType ,[PanelStateKey, PanelEntries]: [keyof SvgSettingSvgurt, SvgSettingSvgurt[keyof SvgSettingSvgurt]]
			) => void;
  }
  & ImageViewerStore
  & SvgViewerStore
  & MessageStore
  & PushMessageStore;

export const useStore = create<SevinguState>(
	catchStoreError<SevinguState>((error, set, get) => {
		console.warn(error);
		if (!(error instanceof Error)) {
			return;
		}
		if (error.message.includes('Failed to load image')) {
			set({
				pushMessage: {
					title: '이미지 파일이 맞는지 확인해주세요',
					description: '에러가 발생했습니다',
				},
			});
			get().sendMessage('ShowPushAlert');
		}
	})((set, get) => ({
		undoRedoStack: [],
		currentIndex: -1,
		hasShownDefaultImage: true,
		getCurImage: () => {
			const idx = get().currentIndex;
			if (idx === -1) return;
			return get().undoRedoStack.at(idx);
		},

		setCurImage: (sevinguImage, isUndoRedoAction) =>
			set(state => {
				if (isUndoRedoAction !== true) {
					const newStack = state.undoRedoStack.slice(0, state.currentIndex + 1);
					const imageObj: SevinguImage = {
						...sevinguImage,
						setting: get().svgPanelState,
						timeStamp: Date.now(),
					};
					newStack.push(imageObj);
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

			get().showImage(imageObj, true);
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
			get().showImage(imageObj, true);
			console.log('execute undo');
		},

		download: () => {
			const canvasRef = get().imageViewer;
			if (!canvasRef) {
				console.error('Canvas reference is null.');
				return;
			}

			const canvas2dContext = canvasRef.getContext('2d', {
				willReadFrequently: true,
			});
			if (!canvas2dContext) {
				console.error('Canvas context is null.');
				return;
			}

			const imageData = canvas2dContext.getImageData(
				0,
				0,
				canvasRef.width,
				canvasRef.height
			);
			const svgPanelState = get().svgPanelState;
			const renderer = new SvgRenderer(
				{
					...svgPanelState,
				},
				canvasRef.width,
				canvasRef.height,
				imageData.data
			);

			const svgContent = renderer.renderSvg();
			const blob = new Blob([svgContent], {
				type: 'image/svg+xml;charset=utf-8',
			});
			const fileName = prompt(
				'다운로드할 SVG 파일의 이름을 입력하세요.',
				'downloaded_svg.svg'
			);

			if (fileName !== null) {
				const linkElement = document.createElement('a');
				linkElement.download = fileName;
				linkElement.href = URL.createObjectURL(blob);
				linkElement.style.display = 'none';

				document.body.appendChild(linkElement);
				linkElement.click();
				document.body.removeChild(linkElement);

				console.log('SVG 다운로드 완료.');
			} else {
				console.log('다운로드 취소됨.');
			}
		},

		/** ImageViewerStore */
		imageViewer: null,
		imageConfig: { blur: 20 },
		htmlRenderedImage: new Image(),
		imageUri: '',
		sevinguImage: null,
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

		showImage: async (sevinguImage, isUndoRedoAction) => {
			if (sevinguImage === null) return;
			const imagUri = await getFileUri(sevinguImage.imageBlob);
			set(() => ({ sevinguImage }));
			get().setCurImage(sevinguImage, isUndoRedoAction);
			set(() => ({ imageUri: imagUri }));
			get().sendMessage('SuccessToGetImageUri');
			const imageViewer = get().imageViewer;
			console.log('image viewer', imageViewer);
			console.log('svg viewer', get().svgViewer);
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
				DEFAULT_IMAGE_URI,
				imageViewer,
				'SuccessToImageLoaded'
			);
		},
		renderOnViewer: async (imageUri, canvasRef, willSendSevinguMessage) => {
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
			const imagePanelState = get().imagePanelState;
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
					: imagePanelState
			);

			if (willSendSevinguMessage === 'SuccessToImageLoaded') {
				set({
					currentImageData: await canvasFilter.renderImage(),
				});
				canvas2dContext.putImageData(get().currentImageData!, 0, 0);
				get().sendMessage(willSendSevinguMessage);
				return;
			}
			const imageDataFrom = get().currentImageData!;
			const imageDataTo = await canvasFilter.renderImage();
			const svgImageBlender = get().svgImageBlender!;
			svgImageBlender.stopBlending();
			svgImageBlender.setImages(
				svgImageBlender.currentImgData ?? imageDataFrom,
				imageDataTo
			);
			svgImageBlender.startBlending();
			set({ currentImageData: imageDataTo });
			get().sendMessage(willSendSevinguMessage);
		},

		/** SvgViewerStore */
		svgViewer: null,
		svgImageBlender: null,
		isViewerInit: false,
		setIsViewerInit: (isViewerInit: boolean) => {
			set({ isViewerInit: isViewerInit });
		},
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

			const svgPanelState = get().svgPanelState;
			const renderer = new SvgRenderer(
				{
					...svgPanelState,
					// scale: 1,
					// svgRenderType: SVG_RENDER_TYPES.enum.CURVE,
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
		imagePanelState: {
			grayscale: false,
			invert: false,
			blur: 0,
			posterize: false,
			posterizeLevels: 5,
			edgeDetection: false,
			lowThreshold: 20,
			highThreshold: 50,
			postBlur: 0,
		},
		svgPanelState: {
			//svg관련
			scale: 1,
			svgRenderType: SVG_RENDER_TYPES.enum.CIRCLE, // SVGRenderTypes.CURVE, // SVG_RENDER_TYPES.enum.CIRCLE,
			minColorRecognized: 50,
			maxColorRecognized: 200,
			// TODO: 성능을 위해 최소값 설정 필요
			renderEveryXPixels: 6,
			renderEveryYPixels: 6,
			fill: true,
			fillColor: 'rgb(28,32,38)',
			stroke: true,
			radius: 4,
			radiusOnColor: true,
			radiusRandomness: 0.2,
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
			// LINE
			continuous: false,
			minlineLength: 6,
			crossHatch: false,
			amountOfLines: 150,
			lineLength: 6,
			lengthOnColor: true,
			lengthRandomness: 0.2,
			// RECURSIVE
			autoStrokeColor: true,
			recursiveAlgorithm: 'E',
			maxRecursiveDepth: 150,
		},
		changePanelState: (panelType, [key, value]) => {
			if (panelType === 'image' || panelType === 'svg') {
				set(state => ({
					...state,
					[`${panelType}PanelState`]: {
						...state[`${panelType}PanelState`],
						[key]: value,
					},
				}));
				const message =
					panelType === 'image' ? 'ChangeImageSetting' : 'ChangeSvgSetting';
				get().sendMessage(message);
			} else {
				console.error('Invalid panel type. Must be "image" or "svg".');
			}
		},

		/** MessageStore */
		message: SevinguMessage.Default,
		setMessage: message => set(() => ({ message: message })),
		resetMessage: () => set(() => ({ message: SevinguMessage.Default })),
		sendMessage: debounce(message => {
			get().setMessage(message);
			get().resetMessage();
		}, 100),

		/** PushAlert */
		pushMessage: {
			title: '제목입니다',
			description: '설명설명설명설명설명설명설명설명',
		},
		pushMessageQueue: [],
		enqueuePushMessage: (pushMessage: PushMessage) => {
			set({ pushMessageQueue: [...get().pushMessageQueue, pushMessage] });
		},
	}))
);
