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

export const useMessage = (
	on: keyof typeof SevinguMessage,
	callback: (state: SevinguState, prevState: SevinguState) => void
) => {
	useEffect(
		() =>
			useStore.subscribe((state, prevState) => {
				if (state.message === on) {
					callback(state, prevState);
				}
			}),
		[]
	);
};
