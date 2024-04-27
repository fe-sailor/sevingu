import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from '../ui/resizable';
import type { PanelProps } from 'react-resizable-panels';

const MainViewer = () => {
	const handleResizeImage: PanelProps['onResize'] = (a, b) => {};
	return (
		<ResizablePanelGroup
			direction="horizontal"
			className="max-w-md rounded-lg border"
			style={{
				height: '300px',
			}}>
			<ResizablePanel
				defaultSize={50}
				onResize={handleResizeImage}
				collapsible
				minSize={10}>
				<img src="https://picsum.photos/200/300" alt="임시 이미지" />
			</ResizablePanel>
			<ResizableHandle withHandle />
			<ResizablePanel defaultSize={50} collapsible minSize={10}>
				<div
					dangerouslySetInnerHTML={{
						__html: `
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 13.5V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 9.75V10.5" />
            </svg>`,
					}}></div>
			</ResizablePanel>
		</ResizablePanelGroup>
	);
};

export default MainViewer;
