import {
	CanvasSettingSvgurt,
	ImageSize,
	PromiseWithResolvers,
	canvasSettingSchema,
} from '@/lib/canvas-filter/canvas-filter-schema';
import * as StackBlur from 'stackblur-canvas';
import { z } from 'zod';

export class CanvasFilter {
	constructor(
		private imageUri: string,
		private canvas2dContext: CanvasRenderingContext2D,
		private canvasSetting:
			| CanvasSettingSvgurt
			| z.infer<typeof canvasSettingSchema>
	) {}

	async renderImage(): Promise<ImageData> {
		const { width, height, imageElement } = await this.getImageWidthAndHeight();

		this.canvas2dContext.drawImage(imageElement, 0, 0, width, height);
		const imageData = this.canvas2dContext.getImageData(0, 0, width, height);
		this.manipulateImageData(
			imageData,
			this.adaptCanvasSetting(this.canvasSetting),
			width,
			height
		);
		return imageData;
	}

	private async getImageWidthAndHeight(): Promise<ImageSize> {
		const { promise, resolve, reject } =
			await this.promiseWithResolvers<ImageSize>();
		const imageElement = new Image();

		imageElement.onerror = () => reject(new Error('Failed to load image'));
		imageElement.onload = () => {
			resolve({
				imageElement: imageElement,
				height: imageElement.height,
				width: imageElement.width,
			});
		};

		imageElement.src = this.imageUri;
		return await promise;
	}

	private async promiseWithResolvers<T>(): Promise<PromiseWithResolvers<T>> {
		let resolve: (value: T | PromiseLike<T>) => void;
		let reject: (reason?: unknown) => void;

		const promise = new Promise<T>((res, rej) => {
			resolve = res;
			reject = rej;
		});

		return await new Promise<PromiseWithResolvers<T>>(res => {
			res({ promise, resolve, reject });
		});
	}

	private adaptCanvasSetting(
		canvasSetting: CanvasSettingSvgurt | z.infer<typeof canvasSettingSchema>
	): z.infer<typeof canvasSettingSchema> {
		if (this.validateSvgSetting(canvasSetting)) {
			return canvasSetting;
		}
		return {
			useGrayscale: canvasSetting.grayscale,
			useInvert: canvasSetting.invert,
			blur: canvasSetting.blur,
			usePosterize: canvasSetting.posterize,
			posterizeLevels: canvasSetting.posterizeLevels,
			useEdgeDetection: canvasSetting.edgeDetection,
			lowThreshold: canvasSetting.lowThreshold,
			highThreshold: canvasSetting.highThreshold,
		};
	}

	private validateSvgSetting(
		setting: CanvasSettingSvgurt | z.infer<typeof canvasSettingSchema>
	): setting is z.infer<typeof canvasSettingSchema> {
		return canvasSettingSchema.safeParse(setting).success;
	}

	private manipulateImageData(
		imageData: ImageData,
		canvasSetting: z.infer<typeof canvasSettingSchema>,
		width: number,
		height: number
	) {
		// if (imageSettings.grayscale) {
		// 	grayScale(imageData, width, height);
		// }

		// if (imageSettings.invert) {
		// 	invertImage(imageData);
		// }

		if (canvasSetting.blur && canvasSetting.blur > 0) {
			this.blurImage(imageData, canvasSetting.blur, width, height);
		}

		// if (imageSettings.posterize) {
		// 	posterizeImage(imageData, imageSettings.posterizeLevels);
		// }

		// if (imageSettings['Edge Detection']) {
		// 	cannyEdgeDetection(
		// 		imageData,
		// 		imageSettings.lowThreshold,
		// 		imageSettings.highThreshold,
		// 		width,
		// 		height
		// 	);
		// }

		// if (imageSettings.applyFractalField) {
		// 	fractalField(imageData, imageSettings, width);
		// }

		// if (imageSettings.postBlur && imageSettings.postBlur > 0) {
		// 	blurImage(imageData, imageSettings.postBlur, width, height);
		// }
	}

	private blurImage(
		imageData: ImageData,
		blur: number,
		width: number,
		height: number
	) {
		StackBlur.imageDataRGB(imageData, 0, 0, width, height, Math.floor(blur));
	}
}
