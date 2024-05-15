import { CanvasSettingSvgurt } from '@/lib/canvas-filter/canvas-filter-schema';
import { SvgSettingSvgurt } from '@/lib/svg-renderers/svg-renderer-schema';
import { PanelStateKey } from '@/stores/store';

export const ElementStyle = {
	switch: 'switch',
	slider: 'slider',
	select: 'select',
} as const;

export type PanelType = 'image' | 'svg';

export type Controller = {
	id: keyof SvgSettingSvgurt | keyof CanvasSettingSvgurt; //PanelStateKey;
	name: string;
	style: ElementStyle;
	min?: number;
	max?: number;
	step?: number;
	dependentOn?: string;
	isShowDependentState?: boolean;
	selectList?: { id: string; name: string }[];
};
