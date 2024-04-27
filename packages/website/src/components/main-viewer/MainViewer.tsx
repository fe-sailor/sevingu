import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from '../ui/resizable';
import type { PanelProps } from 'react-resizable-panels';
import {
	MAIN_VIEWER_PANEL_DEFAULT_SIZE_IMG,
	MAIN_VIEWER_PANEL_DEFAULT_SIZE_SVG,
	MAIN_VIEWER_PANEL_MIN_SIZE_IMG,
	MAIN_VIEWER_PANEL_MIN_SIZE_SVG,
	MAIN_VIEWER_HEIGHT,
} from '@/components/main-viewer/const';
import { useEffect, useRef } from 'react';
import { useSvgViewerStore } from '@/stores/svg-viewer-store';
import { useImageViewerStore } from '@/stores/image-viewer-store';

const MainViewer = () => {
	const imageViewerRef = useRef<HTMLCanvasElement | null>(null);
	const { setImageViewer, getImageUri } = useImageViewerStore();

	const svgViewerRef = useRef<HTMLDivElement | null>(null);
	const { setSvgViewer } = useSvgViewerStore();

	const handleResizeImage: PanelProps['onResize'] = (a, b) => {};

	const handleImageChange: React.ChangeEventHandler<
		HTMLInputElement
	> = event => {
		getImageUri(event);
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
					<div
						ref={svgViewerRef}
						dangerouslySetInnerHTML={{
							__html:
								// NOTE: 임시로 넣어둔 svg
								`
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 13.5V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 9.75V10.5" />
            </svg>`,
						}}></div>
				</ResizablePanel>
			</ResizablePanelGroup>
		</>
	);
};

export default MainViewer;
