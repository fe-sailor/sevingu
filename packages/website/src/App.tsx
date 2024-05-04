import { useRef, useCallback } from 'react'; // useCallback 추가
import { Button } from '@/components/ui/button';
import MainViewer from './components/main-viewer/MainViewer';
import MainPanel from './components/panel/MainPanel';
import { useStore } from '@/stores/store';

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

	return (
		<>
			<div className="px-10">
				<MainViewer />
			</div>
			<div className="flex gap-4 m-4">
				<Button variant="destructive" onClick={handleUploadButtonClick}>
					Image Upload
				</Button>
				<Button variant="destructive" onClick={undo}>
					undo
				</Button>
				<Button variant="destructive" onClick={redo}>
					redo
				</Button>
				{/* downloadWithAd 함수를 사용하도록 수정 */}
				<Button variant="destructive" onClick={downloadWithAd}>
					download
				</Button>
			</div>
			<input
				type="file"
				ref={fileInputRef}
				style={{ display: 'none' }}
				onChange={handleFileChange}
			/>
			<MainPanel />
		</>
	);
}

export default App;
