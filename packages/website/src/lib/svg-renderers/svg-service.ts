const SVG_RENDER_TYPES = { CIRCLE: 'CIRCLE' } as const;

export type SvgSetting = {
	scale: number;
	fill: boolean;
	fillColor: string;
	stroke: boolean;
	svgRenderType: keyof typeof SVG_RENDER_TYPES;
	autoColor: boolean;
	applyFractalDisplacement: string;
	radius: number;
	radiusOnColor: boolean;
	radiusRandomness: number;
	strokeColor: string;
	strokeWidth: number;
	strokeWidthRandomness: number;
	renderEveryXPixels: number;
	renderEveryYPixels: number;
	minColorRecognized: number;
	maxColorRecognized: number;
};

export type Circle = {
	x: number;
	y: number;
	r: number;
	strokeColor: string;
	strokeWidth: number;
};

export type Pixel = {
	r: number;
	g: number;
	b: number;
	a: number;
};

async function renderSvgString(
	clampedArray: Uint8ClampedArray,
	canvasRef: HTMLCanvasElement,
	svgSettings: SvgSetting,
	width: number,
	height: number
) {
	const { scale } = svgSettings;

	// TODO: Figure out why we delay here.
	await new Promise(resolve => setTimeout(resolve));

	const dimensionsString = `height="${height * scale}" width="${
		width * scale
	}"`;

	const nameSpaceString =
		'xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"';
	let svgString = `<svg ${dimensionsString} ${nameSpaceString}>`;

	// eslint-disable-next-line default-case
	switch (svgSettings.svgRenderType) {
		case SVG_RENDER_TYPES.CIRCLE: {
			const circles = createCircles(svgSettings, clampedArray, width, height);
			svgString += renderCircles(svgSettings, circles);
			break;
		}
		// case SVG_RENDER_TYPES.CURVE: {
		// 	const curves = createCurves(svgSettings, clampedArray, width, height);

		// 	svgString += renderCurves(svgSettings, curves);
		// 	break;
		// }
		// case SVG_RENDER_TYPES.LINE: {
		// 	const lines = createLines(svgSettings, clampedArray, width, height);

		// 	svgString += renderLines(svgSettings, lines);
		// 	break;
		// }
		// case SVG_RENDER_TYPES.RECURSIVE: {
		// 	const lines = createRecursivePaths(
		// 		svgSettings,
		// 		clampedArray,
		// 		width,
		// 		height
		// 	);

		// 	svgString += renderPaths(svgSettings, lines);
		// 	break;
		// }
		// case SVG_RENDER_TYPES.TRACE: {
		// 	if (!canvas) {
		// 		// eslint-disable-next-line max-len
		// 		throw new Error(
		// 			'Unfortunately, we only support the TRACE configuration in the browser, since it reads data from html canvas. This is on our roadmap to add. Feel free to make a github issue about it to get us moving on it.'
		// 		);
		// 	}

		// 	const paths = potrace.getPaths(
		// 		potrace.traceCanvas(canvas, {
		// 			turdsize: svgSettings.noiseSize,
		// 		})
		// 	);

		// 	svgString += renderPotracePaths(svgSettings, paths);
		// 	break;
		// }
		// case SVG_RENDER_TYPES.CONCENTRIC: {
		// 	const concentricPaths = createConcentricPaths(
		// 		svgSettings,
		// 		imageData,
		// 		width,
		// 		height
		// 	);

		// 	svgString += renderConcentricPaths(
		// 		svgSettings,
		// 		concentricPaths,
		// 		width / 2,
		// 		height / 2
		// 	);
		// }
	}

	svgString += '</svg>';

	return svgString;
}

export function renderCircles(svgSettings: SvgSetting, circles: Circle[]) {
	const { fill, fillColor, scale, stroke } = svgSettings;

	let renderString = '';
	let i = 0;
	for (i = 0; i < circles.length; i++) {
		const { x, y, r, strokeWidth, strokeColor } = circles[i];
		renderString += `<circle cx="${x * scale}" cy="${
			y * scale
		}" r="${r * scale}" style="stroke: ${
			stroke ? strokeColor : 'none'
		}; stroke-width: ${strokeWidth}; fill: ${fill ? fillColor : 'none'};" />`;
	}

	return renderString;
}

function createCircleAtPoint(
	baseX: number,
	baseY: number,
	settings: SvgSetting,
	pixel: Pixel
) {
	const {
		autoColor,
		radius,
		radiusOnColor,
		radiusRandomness,
		strokeColor,
		strokeWidth,
		strokeWidthRandomness,
	} = settings;

	const x = baseX;
	const y = baseY;

	let circleRadius = radius;
	if (radiusOnColor) {
		circleRadius = getPixelColorIntensity(pixel, settings) * radius;
	}

	circleRadius *= 1 - Math.random() * radiusRandomness;

	const circleColor = autoColor
		? `rgb(${pixel.r}, ${pixel.g}, ${pixel.b})`
		: strokeColor;

	const circle = {
		x,
		y,
		r: circleRadius,
		strokeColor: circleColor,
		strokeWidth: strokeWidth * (1 - Math.random() * strokeWidthRandomness),
	};

	return circle;
}

export function createCircles(
	settings: SvgSetting,
	imageData: Uint8ClampedArray,
	width: number,
	height: number
) {
	const { renderEveryXPixels, renderEveryYPixels } = settings;

	const circles = [];
	for (let x = 0; x < width; x += renderEveryXPixels) {
		for (let y = 0; y < height; y += renderEveryYPixels) {
			const pixelColor = getPixelColorAtXY(imageData, x, y, width);
			if (!isInColorThreshold(pixelColor, settings)) {
				continue;
			}

			circles.push(createCircleAtPoint(x, y, settings, pixelColor));
		}
	}
	return circles;
}
export function getPixelColorAtDataIndex(
	imageData: Uint8ClampedArray,
	dataIndex: number
) {
	return {
		r: imageData[dataIndex],
		g: imageData[dataIndex + 1],
		b: imageData[dataIndex + 2],
		a: imageData[dataIndex + 3] / 255,
	};
}

export function getPixelColorAtXY(
	imageData: Uint8ClampedArray,
	x: number,
	y: number,
	width: number
) {
	const dataIndex = (Math.round(x) + Math.round(y) * width) * 4;

	return getPixelColorAtDataIndex(imageData, dataIndex);
}

export function isInColorThreshold(
	pixel: Pixel,
	settings: Pick<SvgSetting, 'minColorRecognized' | 'maxColorRecognized'>
) {
	const { minColorRecognized, maxColorRecognized } = settings;

	return (
		pixel.r >= minColorRecognized &&
		pixel.g >= minColorRecognized &&
		pixel.b >= minColorRecognized &&
		pixel.r <= maxColorRecognized &&
		pixel.g <= maxColorRecognized &&
		pixel.b <= maxColorRecognized
	);
}

export function getPixelColorIntensity(
	pixel: Pixel,
	settings: Pick<SvgSetting, 'minColorRecognized' | 'maxColorRecognized'>
) {
	const { minColorRecognized, maxColorRecognized } = settings;

	const r = pixel.r - minColorRecognized;
	const g = pixel.g - minColorRecognized;
	const b = pixel.b - minColorRecognized;
	const colorSum = Math.max(1, r + g + b);

	const outOf = Math.max(1, Math.abs(maxColorRecognized - minColorRecognized));

	return colorSum / 3 / outOf;
}
