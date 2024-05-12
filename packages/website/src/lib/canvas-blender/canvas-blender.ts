const DEFAULT_BASE_DURATION = 200;

export const BlenderState = {
	Idle: 'Idle',
	Blending: 'Blending',
} as const;

export class ImageDataBlender {
	public currentImgData: ImageData | null = null;
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	private imgDataFrom: ImageData | null = null;
	private imgDataTo: ImageData | null = null;
	private startTime: number | null;
	private blendAmount: number;
	private baseDuration: number;
	private state: keyof typeof BlenderState = 'Idle';

	constructor(
		canvasId: string,
		private duration?: number
	) {
		const canvas = document.getElementById(canvasId);
		if (!canvas) {
			throw new Error(
				`Cannot find canvas: No element with ID '${canvasId}' exists in the document.`
			);
		}
		if (!(canvas instanceof HTMLCanvasElement)) {
			throw new Error(
				`Cannot find canvas: The element with ID '${canvasId}' is not a canvas.`
			);
		}
		this.canvas = canvas;
		this.ctx = this.canvas.getContext('2d', { willReadFrequently: false })!;
		this.startTime = null;
		this.blendAmount = 0;
		this.baseDuration = this.duration ?? DEFAULT_BASE_DURATION;
	}

	startBlending(duration?: number): void {
		if (!this.imgDataFrom || !this.imgDataTo) {
			console.error(`Cannot find images to blend`);
			return;
		}
		this.state = BlenderState.Blending;
		this.duration = duration;
		this.startTime = performance.now();
		requestAnimationFrame(() => this.updateFrame(performance.now())); // 애니메이션 시작
	}

	stopBlending(): void {
		this.state = BlenderState.Idle;
	}

	setImages(imgDataFrom: ImageData, imgDataTo: ImageData): void {
		this.imgDataFrom = imgDataFrom;
		this.imgDataTo = imgDataTo;
	}

	private updateFrame(timestamp: number): void {
		if (this.state !== BlenderState.Blending) {
			return;
		}
		if (!this.startTime) this.startTime = timestamp; // 시작 시간 초기화
		const elapsedTime = timestamp - this.startTime;
		this.blendAmount = elapsedTime / (this.duration ?? this.baseDuration);
		if (this.blendAmount > 1) this.blendAmount = 1; // 최대 블렌드 비율을 1로 제한

		this.blendImageData(
			this.easeOutCubic(this.clamp({ from: 0, to: 1 }, this.blendAmount))
		);

		if (this.blendAmount < 1) {
			requestAnimationFrame(this.updateFrame.bind(this));
		} else {
			this.ctx.putImageData(this.imgDataTo!, 0, 0); // 최종 이미지 표시
			this.currentImgData = null;
			this.state = BlenderState.Idle;
		}
	}

	private blendImageData(blend: number): void {
		const blendedData = this.ctx.createImageData(
			this.canvas.width,
			this.canvas.height
		);

		for (let i = 0; i < blendedData.data.length; i += 4) {
			blendedData.data[i] =
				blend * (this.imgDataTo!.data[i] || 255) +
				(1 - blend) * (this.imgDataFrom!.data[i] || 255); // Red
			blendedData.data[i + 1] =
				blend * (this.imgDataTo!.data[i + 1] || 255) +
				(1 - blend) * (this.imgDataFrom!.data[i + 1] || 255); // Green
			blendedData.data[i + 2] =
				blend * (this.imgDataTo!.data[i + 2] || 255) +
				(1 - blend) * (this.imgDataFrom!.data[i + 2] || 255); // Blue
			blendedData.data[i + 3] =
				blend * this.imgDataTo!.data[i + 3] +
				(1 - blend) * this.imgDataFrom!.data[i + 3]; //Alpha
		}

		this.currentImgData = blendedData;
		this.ctx.putImageData(blendedData, 0, 0);
	}

	private easeOutCubic(x: number): number {
		return 1 - Math.pow(1 - x, 3);
	}

	private clamp = (
		{ from, to }: { from: number; to: number },
		value: number
	) => {
		if (value < from) {
			return from;
		}
		if (to < value) {
			return to;
		}
		return value;
	};
}
