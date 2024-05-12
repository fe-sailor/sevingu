import { Button } from '@/components/ui/button';
import logo from '@/assets/sevingu_logo.png';
import { useStore } from '@/stores/store';
import { Input } from '../ui/input';
import { useCallback } from 'react';

const MainHeader = () => {
	const { showImage, undo, redo, download } = useStore();

	const handleImageChange: React.ChangeEventHandler<
		HTMLInputElement
	> = event => {
		if (!event.target.files?.length) {
			return;
		}
		showImage(event.target.files[0]);
	};

	// 광고를 표시하고 5초 후에 다운로드를 실행
	const downloadWithAd = useCallback(() => {
		console.log('광고 표시 시작...');

		setTimeout(() => {
			console.log('5초 지남, 다운로드 시작...');
			download();
		}, 5000); // 5초 대기
	}, [download]);

	return (
		<div className={'flex gap-9'}>
			<img className="w-10 h-10" src={logo} alt="logo" />
			<Input
				className={'basis-1/4'}
				accept="image/*"
				onChange={handleImageChange}
				type="file"
			/>
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
	);
};

export default MainHeader;
