import { useRef, useCallback } from 'react'; // useCallback 추가
import MainHeader from './components/header/MainHeader';
import MainPanel from './components/panel/MainPanel';
import { useStore } from '@/stores/store';
import { cn } from './lib/utils';
import DualProcessedImageViewer from './components/dual-processed-image-viewer/DualProcessedImageViewer';
import { useMessageListener } from './stores/messageStore';

function App() {
	const [, setCurImage, undo, redo, originalDownload] = useStore(state => [
		state.curImage,
		state.setCurImage,
		state.undo,
		state.redo,
		state.download,
	]);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// 광고를 표시하고 5초 후에 다운로드를 실행
	const downloadWithAd = useCallback(() => {
		console.log('광고 표시 시작...');

		setTimeout(() => {
			console.log('5초 지남, 다운로드 시작...');
			originalDownload();
		}, 5000); // 5초 대기
	}, [originalDownload]);

	const handleUploadButtonClick = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		const reader = new FileReader();

		reader.onloadend = () => {
			setCurImage(reader.result as string);
		};

		if (file) {
			reader.readAsDataURL(file);
		}
	};

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
