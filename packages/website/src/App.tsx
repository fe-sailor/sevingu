import { useRef, useCallback } from 'react'; // useCallback 추가
import MainHeader from './components/header/MainHeader';
import MainPanel from './components/panel/MainPanel';
import { useStore } from '@/stores/store';
import { cn } from './lib/utils';
import DualProcessedImageViewer from './components/dual-processed-image-viewer/DualProcessedImageViewer';
import { useMessageListener } from './stores/messageStore';

function App() {
	useMessageListener({
		on: 'Any',
		listener: state => {
			console.log(state.message);
		},
	});

	return (
		<>
			<MainHeader />
			<div className={cn('flex')}>
				<DualProcessedImageViewer />
				<MainPanel />
			</div>
		</>
	);
}

export default App;
