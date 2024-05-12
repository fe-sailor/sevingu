import { useStore } from '@/stores/store';
import { useCallback } from 'react'; // useCallback 추가
import DualProcessedImageViewer from './components/dual-processed-image-viewer/DualProcessedImageViewer';
import MainHeader from './components/header/MainHeader';
import MainPanel from './components/panel/MainPanel';
import { cn } from './lib/utils';
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
			console.groupCollapsed('MESSAGE : ', state.message);
			console.trace('RECENT FRAMES : ');
			console.groupEnd();
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
