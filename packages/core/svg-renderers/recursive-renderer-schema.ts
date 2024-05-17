import { z } from 'zod';

export const pixelPointSchema = z.object({
	x: z.number().int(),
	y: z.number().int(),
	r: z.number().int().min(0).max(255),
	g: z.number().int().min(0).max(255),
	b: z.number().int().min(0).max(255),
	a: z.number().int().min(0).max(255),
});

export type PixelPoint = z.infer<typeof pixelPointSchema>;

export type PixelData = {
	clampedArray: Uint8ClampedArray;
	width: number;
	height: number;
	betweenX: number;
	betweenY: number;
};

export const RECURSIVE_ALGORITHM = z.enum(['A', 'B', 'C', 'D', 'E']);

export const recursiveSettingSchema = z.object({
	scale: z.number().min(0).max(3),

	minColorRecognized: z.number().min(0).max(255),
	maxColorRecognized: z.number().min(0).max(255),

	renderEveryXPixels: z.number().min(1).max(100),
	renderEveryYPixels: z.number().min(1).max(100),

	useAutoColor: z.boolean(),
	strokeColor: z.string(),
	strokeWidth: z.number().min(1).max(100),
	strokeWidthRandomness: z.number().min(0).max(1),

	recursiveAlgorithm: z.enum(['A', 'B', 'C', 'D', 'E']),
	maxRecursiveDepth: z.number().int().min(1).max(1000),
});

export type RecursiveSetting = z.infer<typeof recursiveSettingSchema>;

export class Recursive {
	private moveX: number;
	private moveY: number;
	public pathString: string = '';

	constructor(
		private x: number,
		private y: number,
		public strokeColor: string,
		public strokeWidth: number
	) {
		this.moveX = x;
		this.moveY = y;
	}

	public getRecursivePath(scale: number, pathString: string) {
		return `M ${this.x * scale} ${this.y * scale} ${pathString}`;
	}

	public buildRecursivePath(
		settings: RecursiveSetting,
		imageData: Uint8ClampedArray,
		width: number,
		height: number,
		isTraveled: boolean[][],
		stack: number
	) {
		if (
			this.moveX < 0 ||
			this.moveY < 0 ||
			this.moveX >= width ||
			this.moveY >= height
		) {
			return '';
		}

		if (isTraveled[this.moveX][this.moveY]) {
			return '';
		}

		const {
			scale,
			maxRecursiveDepth,
			renderEveryXPixels,
			renderEveryYPixels,
			recursiveAlgorithm,
		} = settings;

		let pathString = ` L ${this.moveX * scale} ${this.moveY * scale}`;
		isTraveled[this.moveX][this.moveY] = true;

		if (stack > maxRecursiveDepth) {
			return pathString;
		}

		let moved = false;
		for (let i = -1; i < 2; i++) {
			for (let k = -1; k < 2; k++) {
				if (i === 0 && k === 0) {
					continue;
				}

				// eslint-disable-next-line default-case
				switch (recursiveAlgorithm) {
					case 'A': {
						this.moveX = this.moveX + renderEveryXPixels * i;
						this.moveY = this.moveY + renderEveryYPixels * k;
						break;
					}
					case 'B': {
						this.moveX = this.moveX + Math.abs(renderEveryXPixels * i);
						this.moveY = this.moveY - renderEveryYPixels * k;
						break;
					}
					case 'C': {
						this.moveX = this.moveX + Math.abs(renderEveryXPixels * i);
						this.moveY = this.moveY - Math.abs(renderEveryYPixels * k);
						break;
					}
					case 'D': {
						this.moveX = this.moveX + renderEveryXPixels * i;
						this.moveY = this.moveY + renderEveryYPixels * k;
						break;
					}
					case 'E': {
						this.moveX = this.moveX + Math.abs(renderEveryXPixels * i);
						this.moveY = this.moveY + Math.abs(renderEveryYPixels * k);
						break;
					}
				}

				const pathAddition = this.buildRecursivePath(
					settings,
					imageData,
					width,
					height,
					isTraveled,
					stack + 1
				);

				if (pathAddition) {
					if (moved) {
						pathString += ` M ${this.moveX * scale} ${this.moveY * scale}`;
					} else {
						moved = true;
					}

					pathString += pathAddition;

					if (recursiveAlgorithm === 'D' || recursiveAlgorithm === 'E') {
						return pathString;
					}
				}
			}
		}

		return pathString;
	}
}
