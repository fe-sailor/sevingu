import {
	CanvasSettingSvgurt,
	ImageSize,
	PromiseWithResolvers,
	canvasSettingSchema,
} from '@/lib/canvas-filter/canvas-filter-schema';
import * as StackBlur from 'stackblur-canvas';
import { z } from 'zod';
import jsfeat from 'jsfeat';
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
			postBlur: canvasSetting.postBlur,
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
		if (canvasSetting.useGrayscale) {
			this.grayScale(imageData, width, height);
		}

		if (canvasSetting.useInvert) {
			this.invertImage(imageData);
		}

		if (canvasSetting.blur && canvasSetting.blur > 0) {
			this.blurImage(imageData, canvasSetting.blur, width, height);
		}

		if (canvasSetting.usePosterize) {
			this.posterizeImage(imageData, canvasSetting.posterizeLevels);
		}

		if (canvasSetting.useEdgeDetection) {
			this.cannyEdgeDetection(
				imageData,
				canvasSetting.lowThreshold,
				canvasSetting.highThreshold,
				width,
				height
			);
		}

		if (canvasSetting.postBlur && canvasSetting.postBlur > 0) {
			this.blurImage(imageData, canvasSetting.postBlur, width, height);
		}
	}

	private blurImage(
		imageData: ImageData,
		blur: number,
		width: number,
		height: number
	) {
		StackBlur.imageDataRGB(imageData, 0, 0, width, height, Math.floor(blur));
	}

	private grayScale(imageData: ImageData, width: number, height: number) {
		// TODO: jsfeat type 문제 해결필요
		const grayImageMatrix = new jsfeat.matrix_t(width, height, jsfeat.U8C1_t);

		jsfeat.imgproc.grayscale(imageData.data, width, height, grayImageMatrix);

		const data_u32 = new Uint32Array(imageData.data.buffer);
		let i = grayImageMatrix.cols * grayImageMatrix.rows;
		let pix = 0;

		const alpha = 0xff << 24;
		while (--i >= 0) {
			pix = grayImageMatrix.data[i];
			data_u32[i] = alpha | (pix << 16) | (pix << 8) | pix;
		}

		return grayImageMatrix;
	}

	invertImage(imageData: ImageData) {
		for (let i = 0; i < imageData.data.length; i++) {
			if ((i + 1) % 4 !== 0) {
				// Skip alpha channel.
				imageData.data[i] = 255 - imageData.data[i];
			}
		}
	}

	posterizeImage(imageData: ImageData, posterizeLevels: number) {
		const numOfAreas = 256 / posterizeLevels;
		const numOfValues = 255 / (posterizeLevels - 1);

		for (let i = 0; i < imageData.data.length; i++) {
			if ((i + 1) % 4 !== 0) {
				// Skip alpha channel.
				imageData.data[i] = Math.floor(
					Math.floor(imageData.data[i] / numOfAreas) * numOfValues
				);
			}
		}
	}

	cannyEdgeDetection(
		imageData: ImageData,
		lowThreshold: number,
		highThreshold: number,
		width: number,
		height: number
	) {
		const matrix = new jsfeat.matrix_t(width, height, jsfeat.U8C1_t);

		jsfeat.imgproc.grayscale(imageData.data, width, height, matrix);

		jsfeat.imgproc.canny(matrix, matrix, lowThreshold, highThreshold);

		const data_u32 = new Uint32Array(imageData.data.buffer);
		let i = matrix.cols * matrix.rows;
		let pix = 0;

		const alpha = 0xff << 24;
		while (--i >= 0) {
			pix = matrix.data[i];
			data_u32[i] = alpha | (pix << 16) | (pix << 8) | pix;
		}
	}
}
