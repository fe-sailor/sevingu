import { StateCreator } from 'zustand';

export type MiddleWare<T> = (config: StateCreator<T>) => StateCreator<T>;

export const catchStoreError =
	<T extends object>(
		errorHandler: (
			error: unknown,
			...parametersStateCreator: Parameters<StateCreator<T>>
		) => void
	) =>
	(config: StateCreator<T>) =>
	(...parametersStateCreator: Parameters<StateCreator<T>>) =>
		Object.entries(config(...parametersStateCreator)).reduce<T>(
			(prev, [key, value]) => ({
				...prev,
				[key]:
					typeof value === 'function'
						? async (...args: unknown[]) => {
								try {
									await value(...args);
								} catch (error) {
									errorHandler(error, ...parametersStateCreator);
								}
							}
						: value,
			}),
			{} as T
		);
