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
	ChangeImageSetting: 'ChangeImageSetting',
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
	on: keyof typeof SevinguMessage | 'Any';
	listener: (state: SevinguState, prevState: SevinguState) => void;
	onError?: (error: unknown) => void;
};

export const useMessageListener = (...listeners: MessageListener[]) => {
	useEffect(
		() =>
			useStore.subscribe((state, prevState) => {
				for (const { on, listener, onError } of listeners) {
					const isOnAnyMessage =
						on === 'Any' &&
						state.message !== prevState.message &&
						state.message !== 'Default';

					if (isOnAnyMessage || state.message === on) {
						try {
							listener(state, prevState);
						} catch (error) {
							onError?.(error) ?? console.error(error);
						}
					}
				}
			}),
		[listeners]
	);
};
