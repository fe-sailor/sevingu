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
	constructor(
		private x: number,
		private y: number,
		public pathString: string,
		public strokeColor: string,
		public strokeWidth: number
	) {}
	buildRecursivePath(
		settings: RecursiveSetting,
		imageData: Uint8ClampedArray,
		width: number,
		height: number,
		isTraveled: boolean[][],
		stack: number
	) {
		if (this.x < 0 || this.y < 0 || this.x >= width || this.y >= height) {
			return '';
		}

		if (isTraveled[this.x][this.y]) {
			return '';
		}

		const {
			scale,
			maxRecursiveDepth,
			renderEveryXPixels,
			renderEveryYPixels,
			recursiveAlgorithm,
		} = settings;

		let pathString = ` L ${this.x * scale} ${this.y * scale}`;
		isTraveled[this.x][this.y] = true;

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
						this.x = this.x + renderEveryXPixels * i;
						this.y = this.y + renderEveryYPixels * k;
						break;
					}
					case 'B': {
						this.x = this.x + Math.abs(renderEveryXPixels * i);
						this.y = this.y - renderEveryYPixels * k;
						break;
					}
					case 'C': {
						this.x = this.x + Math.abs(renderEveryXPixels * i);
						this.y = this.y - Math.abs(renderEveryYPixels * k);
						break;
					}
					case 'D': {
						this.x = this.x + renderEveryXPixels * i;
						this.y = this.y + renderEveryYPixels * k;
						break;
					}
					case 'E': {
						this.x = this.x + Math.abs(renderEveryXPixels * i);
						this.y = this.y + Math.abs(renderEveryYPixels * k);
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
						pathString += ` M ${this.x * scale} ${this.y * scale}`;
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
