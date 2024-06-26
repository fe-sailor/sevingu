import {
	HEIGHT,
	PANEL_DEFAULT_SIZE_IMG,
	PANEL_DEFAULT_SIZE_SVG,
	PANEL_MIN_SIZE_IMG,
	PANEL_MIN_SIZE_SVG,
	SVG_VIEWER_ID,
} from '@/components/dual-processed-image-viewer/const';
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from '@/components/ui/resizable';
import { Skeleton } from '@/components/ui/skeleton';
import { CONTROLLER_BOUNDARY_ID, DEFAULT_IMAGE_URI } from '@/constants';
import { SevinguImage } from '@sevingu/core';
import { ImageDataBlender } from '@sevingu/core';
import { cn, loadImageAsBlob } from '@/lib/utils';
import { useImageViewerStore } from '@/stores/imageViewerStore';
import { useMessageListener, useMessageStore } from '@/stores/messageStore';
import { useStore } from '@/stores/store';
import { useSvgViewerStore } from '@/stores/svgViewerStore';
import { useDropZone } from '@reactuses/core';
import { useEffect, useRef, useState } from 'react';
import type { PanelProps } from 'react-resizable-panels';

const DualProcessedImageViewer = () => {
	const { setState, getState } = useStore;
	const [isShowViewers, setIsShowViewers] = useState(false);
	const imageViewerRef = useRef<HTMLCanvasElement | null>(null);
	const { setImageViewer, showImage } = useImageViewerStore();
	const { isViewerInit, setIsViewerInit } = useSvgViewerStore();
	const { sendMessage } = useMessageStore();
	const svgBlender = useRef<{ unsubscribe?: () => void }>({});

	const svgViewerRef = useRef<HTMLCanvasElement | null>(null);

	const dragOverRef = useRef<HTMLDivElement | null>(null);
	const [isImagePanelMinSize, setIsImagePanelMinSize] = useState(false);
	const [isSvgPanelMinSize, setIsSvgPanelMinSize] = useState(false);

	const handleResizeImage: PanelProps['onResize'] = currentSize => {
		if (currentSize === PANEL_MIN_SIZE_IMG) {
			setIsImagePanelMinSize(true);
			return;
		}
		setIsImagePanelMinSize(false);
	};
	const handleResizeSvg: PanelProps['onResize'] = currentSize => {
		if (currentSize === PANEL_MIN_SIZE_SVG) {
			setIsSvgPanelMinSize(true);
			return;
		}
		setIsSvgPanelMinSize(false);
	};

	const isOver = useDropZone(dragOverRef, files => {
		if (!files) {
			return;
		}
		showImage(new SevinguImage(files[0]));
	});

	useMessageListener(
		{
			on: 'SetImageViewerFirstTime',
			listener: state => {
				state.showDefaultImage();
			},
		},
		{
			on: 'SuccessToImageLoaded',
			listener: state => {
				state.showSvg();
			},
		},
		{
			on: 'ReadyToShowDefaultImage',
			listener: () => {
				setIsShowViewers(true);
				svgBlender.current.unsubscribe?.();
			},
		},
		{
			on: 'ChangeImageSetting',
			listener: state => {
				if (!state.sevinguImage?.imageBlob) {
					console.error('empty image blob');
					return;
				}
				state.showImage(state.sevinguImage);
			},
		},
		{
			on: 'ChangeSvgSetting',
			listener: state => {
				state.showSvg();
			},
		}
	);

	useEffect(() => {
		if (!imageViewerRef.current) {
			return;
		}
		setImageViewer(imageViewerRef.current);
	}, [setImageViewer]);

	useEffect(() => {
		if (!svgViewerRef.current) {
			return;
		}
		const imageblender = new ImageDataBlender(SVG_VIEWER_ID);
		svgBlender.current.unsubscribe = imageblender.onBlendingFinished(() => {
			if (!isViewerInit) {
				setIsViewerInit(true);
				sendMessage('ReadyToShowDefaultImage');
			}
		});
		setState({
			svgViewer: svgViewerRef.current,
			svgImageBlender: imageblender,
		});
	}, [setState, setIsViewerInit, sendMessage, isViewerInit]);

	useEffect(() => {
		if (getState().sevinguImage?.imageBlob) {
			return;
		}
		loadImageAsBlob(DEFAULT_IMAGE_URI).then(imageBlob => {
			if (imageBlob !== undefined)
				setState({ sevinguImage: new SevinguImage(imageBlob) });
		});
	}, [setState, getState]);

	return (
		<>
			<div
				id={CONTROLLER_BOUNDARY_ID}
				className={'w-screen bg-slate-50'}
				ref={dragOverRef}>
				<ResizablePanelGroup
					direction="horizontal"
					className={cn('rounded-lg mx-auto', {
						'border-lime-400 border-dashed bg-lime-50': isOver,
					})}
					style={{
						height: HEIGHT,
					}}>
					<ResizablePanel
						defaultSize={PANEL_DEFAULT_SIZE_IMG}
						onResize={handleResizeImage}
						collapsible
						minSize={PANEL_MIN_SIZE_IMG}>
						<div className="w-full h-full relative flex justify-center items-center">
							<div
								className={cn(
									'absolute w-full h-full bg-transparent transition-colors',
									{
										'bg-slate-900/20': isImagePanelMinSize,
									}
								)}></div>
							<canvas
								className={cn('invisible', { visible: isShowViewers })}
								ref={imageViewerRef}></canvas>
							{isShowViewers ? null : (
								<Skeleton
									className={cn(
										'absolute h-[600px] w-4/5 min-w-64 max-w-96 rounded-lg bg-slate-200',
										{}
									)}
								/>
							)}
						</div>
					</ResizablePanel>
					<ResizableHandle withHandle />
					<ResizablePanel
						defaultSize={PANEL_DEFAULT_SIZE_SVG}
						onResize={handleResizeSvg}
						collapsible
						minSize={PANEL_MIN_SIZE_SVG}>
						<div className="w-full h-full relative flex justify-center items-center">
							<div
								className={cn(
									'absolute w-full h-full bg-transparent transition-colors',
									{
										'bg-slate-900/20': isSvgPanelMinSize,
									}
								)}></div>
							<canvas
								className={cn('invisible ', { visible: isShowViewers })}
								ref={svgViewerRef}
								id={SVG_VIEWER_ID}></canvas>
							{isShowViewers ? null : (
								<Skeleton
									className={cn(
										'absolute h-[600px] w-4/5 min-w-64 max-w-96 rounded-lg bg-slate-200',
										{}
									)}
								/>
							)}
						</div>
					</ResizablePanel>
				</ResizablePanelGroup>
			</div>
		</>
	);
};

export default DualProcessedImageViewer;
