import { SevinguState, useStore } from '@/stores/store';
import { useEffect } from 'react';

export type MessageStore = {
	message: keyof typeof SevinguMessage;
	setMessage: (message: keyof typeof SevinguMessage) => void;
	sendMessage: (message: keyof typeof SevinguMessage) => void;
	resetMessage: () => void;
};

export const SevinguMessage = {
	Default: 'Default',
	SetImageViewerFirstTime: 'SetImageViewerFirstTime',
	SuccessToGetImageUri: 'SuccessToGetImageUri',
	SuccessToImageLoaded: 'SuccessToImageLoaded',
	SuccessToSvgRendered: 'SuccessToSvgRendered',
	ChangeSvgSetting: 'ChangeSvgSetting',
	EndedGoogleAd: 'EndedGoogleAd',
} as const;

export const useMessageStore = () =>
	useStore<MessageStore>(state => ({
		message: state.message,
		setMessage: state.setMessage,
		sendMessage: state.sendMessage,
		resetMessage: state.resetMessage,
	}));

export type MessageListener = {
	on: keyof typeof SevinguMessage;
	listener: (state: SevinguState, prevState: SevinguState) => void;
};

export const useMessage = (...listeners: MessageListener[]) => {
	useEffect(
		() =>
			useStore.subscribe((state, prevState) => {
				for (const { on, listener } of listeners) {
					if (state.message === on) {
						listener(state, prevState);
					}
				}
			}),
		[listeners]
	);
};
