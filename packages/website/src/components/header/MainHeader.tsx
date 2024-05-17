import logo from '@/assets/sevingu_logo.svg';
import { Button } from '@/components/ui/button';
import { useStore } from '@/stores/store';
import { useCallback } from 'react';
import { Input } from '../ui/input';
import { SevinguImage } from '@sevingu/core';
import { Download, Upload, Undo2, Redo2 } from 'lucide-react';

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
		<div
			className={
				'flex items-center justify-between shadow-header sticky bg-background-mainui text-white'
			}>
			<div className={'flex justify-center items-center gap-2'}>
				<img className={'w-16 h-16 ml-4 invert'} src={logo} alt="logo" />
				<span className={'font-sans text-2xl font-bold'}>Sevingu</span>
			</div>
			<div className={'flex gap-5 mr-3'}>
				<Button
					className={
						'bg-background-mainui hover:scale-105 hover:drop-shadow hover:bg-white hover:text-text-mainui transition-all duration-300 ease-in-out'
					}>
					<label className={'cursor-pointer flex items-center'}>
						<Upload className="mr-2 h-4 w-5" /> upload
						<input
							className="hidden"
							accept="image/*"
							onChange={handleImageChange}
							type="file"></input>
					</label>
				</Button>
				<Button
					className={
						'bg-background-mainui hover:scale-105 hover:drop-shadow hover:bg-white hover:text-text-mainui transition-all duration-300 ease-in-out'
					}
					onClick={undo}>
					<Undo2 className="mr-2 h-4 w-4" /> undo
				</Button>
				<Button
					className={
						'bg-background-mainui hover:scale-105 hover:drop-shadow hover:bg-white hover:text-text-mainui transition-all duration-300 ease-in-out'
					}
					onClick={redo}>
					<Redo2 className="mr-2 h-4 w-4" /> redo
				</Button>

				{/* downloadWithAd 함수를 사용하도록 수정 */}
				<Button
					className={
						'bg-background-mainui hover:scale-105 hover:drop-shadow hover:bg-white hover:text-text-mainui transition-all duration-300 ease-in-out'
					}
					onClick={downloadWithAd}>
					<Download className="mr-2 h-4 w-4" /> download
				</Button>
			</div>
		</div>
	);
};

export default MainHeader;
