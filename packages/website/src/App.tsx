import { useRef, useCallback } from 'react'; // useCallback 추가
import MainHeader from './components/header/MainHeader';
import MainPanel from './components/panel/MainPanel';
import { useStore } from '@/stores/store';
import { cn } from './lib/utils';
import DualProcessedImageViewer from './components/dual-processed-image-viewer/DualProcessedImageViewer';
import { useMessageListener } from './stores/messageStore';

function App() {
	const [originalDownload] = useStore(state => [state.download]);

	// 광고를 표시하고 5초 후에 다운로드를 실행
	const downloadWithAd = useCallback(() => {
		console.log('광고 표시 시작...');

		setTimeout(() => {
			console.log('5초 지남, 다운로드 시작...');
			originalDownload();
		}, 5000); // 5초 대기
	}, [originalDownload]);

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
