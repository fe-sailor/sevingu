import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { z } from 'zod';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const rgbRegex =
	/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/;

export const rgbValidator = z.string().refine(
	value => {
		const match = value.match(rgbRegex);
		if (!match) {
			return false;
		}

		return match.slice(1).every(num => {
			const n = parseInt(num, 10);
			return n >= 0 && n <= 255;
		});
	},
	{
		message: 'Invalid RGB format',
	}
);

export const stringJoin = (...strings: (string | (() => string))[]): string => {
	return strings.reduce<string>((prevString, curString) => {
		return (prevString +=
			typeof curString === 'string' ? curString : curString());
	}, '');
};

export const exhaustiveTypeCheck = (never: never) => {
	throw new Error(never);
};

export type PromiseWithResolvers<T> = {
	promise: Promise<T>;
	resolve: (value: T | PromiseLike<T>) => void;
	reject: (reason?: unknown) => void;
};

export const promiseWithResolvers = async <T>(): Promise<
	PromiseWithResolvers<T>
> => {
	let resolve: (value: T | PromiseLike<T>) => void;
	let reject: (reason?: unknown) => void;

	const promise = new Promise<T>((res, rej) => {
		resolve = res;
		reject = rej;
	});

	return await new Promise<PromiseWithResolvers<T>>(res => {
		res({ promise, resolve, reject });
	});
};

export const getFileUri = async (imageBlob: Blob): Promise<string> => {
	const { promise, resolve, reject } = await promiseWithResolvers<string>();
	const reader = new FileReader();
	reader.onloadend = () => {
		const imagUri = reader.result;

		if (typeof imagUri !== 'string') {
			console.error('image data uri is not string');
			return;
		}
		resolve(imagUri);
	};

	reader.onerror = reject;

	reader.readAsDataURL(imageBlob);
	return await promise;
};

export const getImageDataFromImageUri = async (
	imageUri: string
): Promise<ImageData> => {
	const { promise, resolve, reject } = await promiseWithResolvers<ImageData>();
	const imageElement = new Image();
	const canvasElement = document.createElement('canvas');
	const canvas2dContext = canvasElement.getContext('2d', {
		// NOTE: canvas 성능향상을 위한 코드 임
		willReadFrequently: true,
	});

	if (!canvas2dContext) {
		reject(new Error('Failed to get canvas context'));
		return await promise;
	}

	imageElement.onerror = () => reject(new Error('Failed to load image'));
	imageElement.onload = () => {
		canvasElement.width = imageElement.width;
		canvasElement.height = imageElement.height;
		canvas2dContext.drawImage(imageElement, 0, 0);
		try {
			const imageData = canvas2dContext.getImageData(
				0,
				0,
				imageElement.width,
				imageElement.height
			);
			resolve(imageData);
		} catch (error) {
			reject(new Error('Failed to extract ImageData'));
		}
	};

	imageElement.src = imageUri;
	return await promise;
};

export type ImageSize = {
	imageElement: HTMLImageElement;
	width: number;
	height: number;
};

export const getImageWidthAndHeight = async (
	imageUri: string
): Promise<ImageSize> => {
	const { promise, resolve, reject } = await promiseWithResolvers<ImageSize>();
	const imageElement = new Image();

	imageElement.onerror = () => reject(new Error('Failed to load image'));
	imageElement.onload = () => {
		resolve({
			imageElement: imageElement,
			height: imageElement.height,
			width: imageElement.width,
		});
	};

	imageElement.src = imageUri;
	return await promise;
};

export const getSvgUrl = (svgString: string): string => {
	const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
	const url = URL.createObjectURL(blob);
	return url;
};
