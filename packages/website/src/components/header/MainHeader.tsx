import logo from '@/assets/sevingu_logo.png';
import { Button } from '@/components/ui/button';
import { useStore } from '@/stores/store';
import React, { useEffect, useCallback, useState } from 'react';
//import { Input } from '../ui/input';
import Modal from '../header/Modal';

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

	const [open, setOpen] = useState<boolean>(false);

	const loadAdsScript = () => {
		const script = document.createElement('script');
		script.src =
			'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6928722768955365';
		script.async = true;
		script.crossOrigin = 'anonymous';
		document.body.appendChild(script);

		script.onload = () => {
			(window.adsbygoogle = window.adsbygoogle || []).push({});
		};
	};

	// download 버튼을 클릭하면 모달 열기 및 광고 표시 후 다운로드 실행
	const downloadWithAd = useCallback(() => {
		setOpen(true); // 모달 열기
		console.log('광고 표시 시작...');
		loadAdsScript(); // 광고 스크립트 로드 및 광고 표시

		setTimeout(() => {
			console.log('5초 지남, 다운로드 시작...');
			download();
			setOpen(false); // 다운로드 시작 후 모달 닫기
		}, 5000); // 5초 대기
	}, [download]);
	return (
		<div>
			<div className="p-10 flex justify-center w-full">
				{/* 모달 관련 코드는 삭제하거나, 필요에 따라 다른 버튼에 사용 */}
			</div>

			<div className={'flex gap-9'}>
				<img className="w-10 h-10" src={logo} alt="logo" />

				<Button variant="destructive" onClick={undo}>
					<label>
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

			{/* download 버튼 클릭 시 나타나는 모달 */}
			<Modal open={open} onClose={() => setOpen(false)}>
				<div className="flex flex-col gap-4">
					{/* 광고가 여기에 표시됩니다 */}
					<ins
						className="adsbygoogle"
						style={{ display: 'block' }}
						data-ad-client="ca-pub-6928722768955365"
						data-ad-slot="6824236443"
						data-ad-format="auto"
						data-full-width-responsive="true"></ins>
				</div>
				<h1 className="text-2Xl">Thanks for using Sevingu.com!</h1>
			</Modal>
		</div>
	);
};

export default MainHeader;
