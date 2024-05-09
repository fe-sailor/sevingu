export class ImageBlender {
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	private imgFrom: HTMLImageElement;
	private imgTo: HTMLImageElement;
	private startTime: number | null;
	private blendAmount: number;

	constructor(
		canvasId: string,
		imageUrlFrom: string,
		imageUrlTo: string,
		private duration: number
	) {
		this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
		this.ctx = this.canvas.getContext('2d')!;
		this.imgFrom = new Image();
		this.imgTo = new Image();
		this.imgFrom.src = imageUrlFrom;
		this.imgTo.src = imageUrlTo;
		this.startTime = null;
		this.blendAmount = 0;

		this.imgFrom.onload = () => {
			this.imgTo.onload = () => {
				this.startTime = performance.now();
				this.updateFrame(performance.now()); // 모든 이미지 로드 후 애니메이션 시작
			};
		};
	}

	private updateFrame(timestamp: number): void {
		if (!this.startTime) this.startTime = timestamp; // 시작 시간 초기화
		const elapsedTime = timestamp - this.startTime;
		this.blendAmount = elapsedTime / this.duration;
		if (this.blendAmount > 1) this.blendAmount = 1; // 최대 블렌드 비율을 1로 제한

		this.blendImages(this.easeOutCubic(this.blendAmount));

		if (this.blendAmount < 1) {
			requestAnimationFrame(this.updateFrame.bind(this));
		}
	}

	private blendImages(blend: number): void {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.globalAlpha = 1 - blend;
		this.ctx.drawImage(
			this.imgFrom,
			0,
			0,
			this.canvas.width,
			this.canvas.height
		);
		this.ctx.globalAlpha = blend;
		this.ctx.drawImage(this.imgTo, 0, 0, this.canvas.width, this.canvas.height);
	}

	private easeOutCubic(x: number): number {
		return 1 - Math.pow(1 - x, 3);
	}
}
