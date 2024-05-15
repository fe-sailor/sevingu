import logo from '@/assets/sevingu_logo.png';
import { Button } from '@/components/ui/button';
import { useStore } from '@/stores/store';
import { useCallback } from 'react';
import { Input } from '../ui/input';
import { SevinguImage } from '@/lib/SevinguImage';

const MainHeader = () => {
	const { showImage, undo, redo, download } = useStore();

	const handleImageChange: React.ChangeEventHandler<
		HTMLInputElement
	> = event => {
		if (!event.target.files?.length) {
			return;
		}
		showImage(new SevinguImage(event.target.files[0]));
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
		<div className={'flex gap-9 items-center'}>
			<div className={'flex justify-center items-center'}>
				<img className={'w-16 h-16 ml-4'} src={logo} alt="logo" />
				<span className={'font-sans text-lg font-bold'}>Sevingu</span>
			</div>

			<Button variant="destructive">
				<label className="cursor-pointer">
					<span>upload</span>
					<input
						className="hidden"
						accept="image/*"
						onChange={handleImageChange}
						type="file"></input>
				</label>
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
	);
};

export default MainHeader;
