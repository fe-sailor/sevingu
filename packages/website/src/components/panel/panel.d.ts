import { PanelStateKey } from '@/stores/store';

export type ElementStyle = 'switch' | 'slider' | 'select';
export type Controller = {
	id: PanelStateKey;
	name: string;
	style: ElementStyle;
};
