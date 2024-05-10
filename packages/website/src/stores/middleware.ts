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
						? (...args: unknown[]) => {
								try {
									const result = value(...args);
									if (result instanceof Promise) {
										return result.catch(error =>
											errorHandler(error, ...parametersStateCreator)
										);
									}
									return result;
								} catch (error) {
									errorHandler(error, ...parametersStateCreator);
								}
							}
						: value,
			}),
			{} as T
		);
