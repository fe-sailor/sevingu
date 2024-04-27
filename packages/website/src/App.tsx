import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import MainViewer from './components/main-viewer/MainViewer';
import { useStore } from '@/stores/store';

function App() {
	const [, setCurImage, undo, redo] = useStore(state => [
		state.curImage,
		state.setCurImage,
		state.undo,
		state.redo,
	]);
	const fileInputRef = useRef<HTMLInputElement>(null);

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
			</div>
			<input
				type="file"
				ref={fileInputRef}
				style={{ display: 'none' }}
				onChange={handleFileChange}
			/>
			<Panel />
		</>
	);
}

export default App;
