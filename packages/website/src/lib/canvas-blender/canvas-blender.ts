export class ImageDataBlender {
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	private imgDataFrom: ImageData;
	private imgDataTo: ImageData;
	private startTime: number | null;
	private blendAmount: number;

	constructor(
		canvasId: string,
		imgDataFrom: ImageData,
		imgDataTo: ImageData,
		private duration: number
	) {
		this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
		this.ctx = this.canvas.getContext('2d')!;
		this.imgDataFrom = imgDataFrom;
		this.imgDataTo = imgDataTo;
		this.startTime = null;
		this.blendAmount = 0;

		this.startBlending();
	}

	private startBlending(): void {
		this.startTime = performance.now();
		this.updateFrame(performance.now()); // 애니메이션 시작
	}

	private updateFrame(timestamp: number): void {
		if (!this.startTime) this.startTime = timestamp; // 시작 시간 초기화
		const elapsedTime = timestamp - this.startTime;
		this.blendAmount = elapsedTime / this.duration;
		if (this.blendAmount > 1) this.blendAmount = 1; // 최대 블렌드 비율을 1로 제한

		this.blendImageData(
			this.easeOutCubic(this.clamp({ from: 0, to: 1 }, this.blendAmount))
		);

		if (this.blendAmount < 1) {
			requestAnimationFrame(this.updateFrame.bind(this));
		} else {
			this.ctx.putImageData(this.imgDataTo, 0, 0); // 최종 이미지 표시
		}
	}

	private blendImageData(blend: number): void {
		const blendedData = this.ctx.createImageData(
			this.canvas.width,
			this.canvas.height
		);

		for (let i = 0; i < blendedData.data.length; i += 4) {
			blendedData.data[i] =
				blend * (this.imgDataTo.data[i] || 255) +
				(1 - blend) * (this.imgDataFrom.data[i] || 255); // Red
			blendedData.data[i + 1] =
				blend * (this.imgDataTo.data[i + 1] || 255) +
				(1 - blend) * (this.imgDataFrom.data[i + 1] || 255); // Green
			blendedData.data[i + 2] =
				blend * (this.imgDataTo.data[i + 2] || 255) +
				(1 - blend) * (this.imgDataFrom.data[i + 2] || 255); // Blue
			blendedData.data[i + 3] =
				blend * (this.imgDataTo.data[i + 3] || 255) +
				(1 - blend) * (this.imgDataFrom.data[i + 3] || 255); //Alpha
		}

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
