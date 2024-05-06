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
import { useMessage } from '@/stores/message.store';

const MainViewer = () => {
	const imageViewerRef = useRef<HTMLCanvasElement | null>(null);
	const { setImageViewer, showImage } = useImageViewerStore();

	const svgViewerRef = useRef<HTMLDivElement | null>(null);
	const { showSvg, setSvgViewer } = useSvgViewerStore();

	const handleResizeImage: PanelProps['onResize'] = (a, b) => {
		a && b;
	};

	const handleImageChange: React.ChangeEventHandler<
		HTMLInputElement
	> = event => {
		if (!event.target.files?.length) {
			return;
		}
		showImage(event.target.files[0]);
	};

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

	useMessage({ on: 'SuccessToImageLoaded', listener: () => showSvg() });

	return (
		<>
			<input accept="image/*" onChange={handleImageChange} type="file" />
			<ResizablePanelGroup
				direction="horizontal"
				className="max-w-md rounded-lg border"
				style={{
					height: MAIN_VIEWER_HEIGHT,
				}}>
				<ResizablePanel
					defaultSize={MAIN_VIEWER_PANEL_DEFAULT_SIZE_IMG}
					onResize={handleResizeImage}
					collapsible
					minSize={MAIN_VIEWER_PANEL_MIN_SIZE_IMG}>
					<canvas className="w-full" ref={imageViewerRef}></canvas>
				</ResizablePanel>
				<ResizableHandle withHandle />
				<ResizablePanel
					defaultSize={MAIN_VIEWER_PANEL_DEFAULT_SIZE_SVG}
					collapsible
					minSize={MAIN_VIEWER_PANEL_MIN_SIZE_SVG}>
					<div ref={svgViewerRef}></div>
				</ResizablePanel>
			</ResizablePanelGroup>
		</>
	);
};

export default MainViewer;
