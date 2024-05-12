import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useMessageListener } from '@/stores/messageStore';
import { useStore } from '@/stores/store';
import { Terminal } from 'lucide-react';
import { useEffect, useState } from 'react';

export type PushMessage = {
	title: string;
	description: string;
};

export type PushMessageStore = {
	pushMessage: PushMessage;
	pushMessageQueue: PushMessage[];
	enqueuePushMessage: (pushMessage: PushMessage) => void;
};

const usePushMessageStore = () =>
	useStore<PushMessageStore>(state => ({
		pushMessage: state.pushMessage,
		pushMessageQueue: state.pushMessageQueue,
		enqueuePushMessage: state.enqueuePushMessage,
	}));

const PushAlert = () => {
	const [isShowing, setIsShowing] = useState(false);
	const { pushMessage } = usePushMessageStore();

	const handleAnimationEnd = () => {
		setIsShowing(false);
	};

	useEffect(() => {}, []);
	useMessageListener({
		on: 'ShowPushAlert',
		listener: () => {
			setIsShowing(true);
		},
	});
	return isShowing ? (
		<div
			onAnimationEnd={handleAnimationEnd}
			className="relative w-screen animate-push-alert opacity-0">
			<Alert className="absolute left-1/2 -translate-x-1/2 h-20 w-80 bottom-0 bg-slate-50">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth={1.5}
					stroke="currentColor"
					className="w-6 h-6">
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"
					/>
				</svg>
				<AlertTitle>{pushMessage.title}</AlertTitle>
				<AlertDescription>{pushMessage.description}</AlertDescription>
			</Alert>
		</div>
	) : null;
};

export default PushAlert;
