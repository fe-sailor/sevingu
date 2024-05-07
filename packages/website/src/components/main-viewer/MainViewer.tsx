import {
	MAIN_VIEWER_HEIGHT,
	MAIN_VIEWER_PANEL_DEFAULT_SIZE_IMG,
	MAIN_VIEWER_PANEL_DEFAULT_SIZE_SVG,
	MAIN_VIEWER_PANEL_MIN_SIZE_IMG,
	MAIN_VIEWER_PANEL_MIN_SIZE_SVG,
} from '@/components/main-viewer/const';
import { useImageViewerStore } from '@/stores/image-viewer.store';
import type { PanelProps } from 'react-resizable-panels';
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from '@/components/ui/resizable';
import { useRef, useEffect } from 'react';
import { useSvgViewerStore } from '@/stores/svg-viewer.store';
import { useMessageListener } from '@/stores/message.store';
import { useDropZone } from '@reactuses/core';
import { cn } from '@/lib/utils';

const MainViewer = () => {
	const imageViewerRef = useRef<HTMLCanvasElement | null>(null);
	const { setImageViewer, showImage } = useImageViewerStore();

	const svgViewerRef = useRef<HTMLDivElement | null>(null);
	const { setSvgViewer } = useSvgViewerStore();

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
		setSvgViewer(svgViewerRef.current);
	}, [setSvgViewer]);

	return (
		<>
			<div ref={dragOverRef}>
				<ResizablePanelGroup
					direction="horizontal"
					className={cn('rounded-lg border-4 border-solid', {
						'border-lime-400 border-dashed bg-lime-50': isOver,
					})}
					style={{
						height: MAIN_VIEWER_HEIGHT,
					}}>
					<ResizablePanel
						defaultSize={MAIN_VIEWER_PANEL_DEFAULT_SIZE_IMG}
						onResize={handleResizeImage}
						collapsible
						minSize={MAIN_VIEWER_PANEL_MIN_SIZE_IMG}>
						<canvas className="mx-auto" ref={imageViewerRef}></canvas>
					</ResizablePanel>
					<ResizableHandle withHandle />
					<ResizablePanel
						defaultSize={MAIN_VIEWER_PANEL_DEFAULT_SIZE_SVG}
						collapsible
						minSize={MAIN_VIEWER_PANEL_MIN_SIZE_SVG}>
						<div
							className="flex justify-center items-center"
							ref={svgViewerRef}></div>
					</ResizablePanel>
				</ResizablePanelGroup>
			</div>
		</>
	);
};

export default MainViewer;
