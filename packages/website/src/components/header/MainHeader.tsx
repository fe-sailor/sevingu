// import { Button } from '@/components/ui/button';
import logo from '@/assets/sevingu_logo.png';
import { useImageViewerStore } from '@/stores/image-viewer.store';
import { useMessageListener } from '@/stores/message.store';
import { Input } from '../ui/input';

const MainHeader = () => {
	const { showImage } = useImageViewerStore();
	const handleImageChange: React.ChangeEventHandler<
		HTMLInputElement
	> = event => {
		if (!event.target.files?.length) {
			return;
		}
		showImage(event.target.files[0]);
	};

	return (
		<div className={'flex gap-9'}>
			<img className="w-10 h-10" src={logo} alt="logo" />
			<Input
				className={'basis-1/4'}
				accept="image/*"
				onChange={handleImageChange}
				type="file"
			/>
		</div>
	);
};

export default MainHeader;
