import { PanelStateKey } from '@/stores/store';

export const SVGRenderTypes = {
	TRACE: 'TRACE',
	CIRCLE: 'CIRCLE',
	CURVE: 'CURVE',
	LINE: 'LINE',
	RECURSIVE: 'RECURSIVE',
	CONCENTRIC: 'CONCENTRIC',
} as const;
export const ElementStyle = {
	switch: 'switch',
	slider: 'slider',
	select: 'select',
} as const;
export type Controller = {
	id: PanelStateKey;
	name: string;
	style: ElementStyle;
};
