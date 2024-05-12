import { isProd } from '@/lib/utils';
import DualProcessedImageViewer from './components/dual-processed-image-viewer/DualProcessedImageViewer';
import MainHeader from './components/header/MainHeader';
import MainPanel from './components/panel/MainPanel';
import { cn } from './lib/utils';
import { useMessageListener } from './stores/messageStore';
import { Rnd } from 'react-rnd';

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
	console.log('Rnd', <Rnd />);

	return (
		<>
			<MainHeader />
			<div className={cn('flex')}>
				<DualProcessedImageViewer />
				{/* ref: https://github.com/bokuweb/react-rnd */}
				<Rnd
					default={{
						x: 0,
						y: 0,
						width: 320,
						height: 200,
					}}>
					<MainPanel />
				</Rnd>
			</div>
		</>
	);
}

export default App;
