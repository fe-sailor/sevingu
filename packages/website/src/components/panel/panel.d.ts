import { CanvasSettingSvgurt } from '@sevingu/core';
import { SvgSettingSvgurt } from '@sevingu/core';
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
	dependentOn2?: string;
	isShowDependentState?: boolean;
	isShowDependent2State?: boolean;
	selectList?: { id: string; name: string }[];
};
