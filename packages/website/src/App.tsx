import { isProd } from '@/lib/utils';
import DualProcessedImageViewer from './components/dual-processed-image-viewer/DualProcessedImageViewer';
import MainHeader from './components/header/MainHeader';
import MainPanel from './components/panel/MainPanel';
import { useMessageListener } from './stores/messageStore';

function App() {
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
		</>
	);
}

export default App;
