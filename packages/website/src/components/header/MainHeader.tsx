import { Button } from '@/components/ui/button';
import logo from '@/assets/sevingu_logo.png';
import { useStore } from '@/stores/store';
import { useMessageListener } from '@/stores/messageStore';
import { Input } from '../ui/input';

const MainHeader = () => {
	const { showImage, undo, redo } = useStore();
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
			<Button variant="destructive" onClick={undo}>
				undo
			</Button>
			<Button variant="destructive" onClick={redo}>
				redo
			</Button>
		</div>
	);
};

export default MainHeader;
