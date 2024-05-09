import {
	HEIGHT,
	PANEL_DEFAULT_SIZE_IMG,
	PANEL_DEFAULT_SIZE_SVG,
	PANEL_MIN_SIZE_IMG,
	PANEL_MIN_SIZE_SVG,
	SVG_VIEWER_ID,
} from '@/components/dual-processed-image-viewer/const';
import { useImageViewerStore } from '@/stores/imageViewerStore';
import type { PanelProps } from 'react-resizable-panels';
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from '@/components/ui/resizable';
import { useRef, useEffect } from 'react';
import { useMessageListener } from '@/stores/messageStore';
import { useDropZone } from '@reactuses/core';
import { cn } from '@/lib/utils';
import { useStore } from '@/stores/store';

const DualProcessedImageViewer = () => {
	const { setState } = useStore;
	const imageViewerRef = useRef<HTMLCanvasElement | null>(null);
	const { setImageViewer, showImage } = useImageViewerStore();

	const svgViewerRef = useRef<HTMLCanvasElement | null>(null);

	const dragOverRef = useRef<HTMLDivElement | null>(null);

	const handleResizeImage: PanelProps['onResize'] = (a, b) => {
		a && b;
	};

	const isOver = useDropZone(dragOverRef, files => {
		if (!files) {
			return;
		}
		showImage(files[0]);
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
			on: 'ChangeImageSetting',
			listener: state => {
				if (!state.imageBlob) {
					console.error('empty image blob');
					return;
				}
				state.showImage(state.imageBlob);
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
		setState({ svgViewer: svgViewerRef.current });
	}, [setState]);

	return (
		<>
			<div ref={dragOverRef}>
				<ResizablePanelGroup
					direction="horizontal"
					className={cn('rounded-lg border-4 border-solid', {
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
						<canvas className="mx-auto" ref={imageViewerRef}></canvas>
					</ResizablePanel>
					<ResizableHandle withHandle />
					<ResizablePanel
						defaultSize={PANEL_DEFAULT_SIZE_SVG}
						collapsible
						minSize={PANEL_MIN_SIZE_SVG}>
						<canvas
							className="mx-auto"
							ref={svgViewerRef}
							id={SVG_VIEWER_ID}></canvas>
					</ResizablePanel>
				</ResizablePanelGroup>
			</div>
		</>
	);
};

export default DualProcessedImageViewer;
