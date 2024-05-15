import { useEffect } from 'react';
import { isProd } from '@/lib/utils';
import DualProcessedImageViewer from './components/dual-processed-image-viewer/DualProcessedImageViewer';
import MainHeader from './components/header/MainHeader';
import MainPanel from './components/panel/MainPanel';
import PushAlert from './components/push-alert/PushAlert';
import { useMessageListener } from './stores/messageStore';
import { useStore } from '@/stores/store';

function App() {
	const { undo, redo } = useStore();

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
				if (event.shiftKey) redo();
				else undo();
				event.preventDefault();
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, []);

	useMessageListener({
		on: 'Any',
		listener: state => {
			if (isProd()) {
				return;
			}
			console.groupCollapsed('MESSAGE : ', state.message);
			console.trace('RECENT FRAMES : ');
			console.groupEnd();
		},
	});

	return (
		<>
			<MainHeader />
			<DualProcessedImageViewer />
			<MainPanel />
			<PushAlert />
		</>
	);
}

export default App;
