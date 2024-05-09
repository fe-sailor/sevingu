import { PanelEntries, useStore } from '@/stores/store';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Slider } from '../ui/slider';
import { Controller, SVGRenderTypes } from './panel';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../ui/select';
import { PanelState, PanelStateKey } from '@/stores/storeType';

export default function PanelElement({ id, name, style }: Controller) {
	const checkPanelIdState = useStore(
		// (state: { panelState: PanelState }) => state.panelState[id as PanelStateKey]
		state => state.panelState[id]
	);
	const changePanelState = useStore(state => state.changePanelState);
	const changePanelValue = (
		value // boolean | number | keyof typeof SVGRenderTypes
	) => {
		changePanelState([id, value]);
	};

	const selectList = [
		{
			id: 'TRACE',
			name: '추적',
		},
		{
			id: 'CIRCLE',
			name: '원',
		},
		{
			id: 'CURVE',
			name: '곡선',
		},
		{
			id: 'LINE',
			name: '선',
		},
		{
			id: 'RECURSIVE',
			name: '반복',
		},
		{
			id: 'CONCENTRIC',
			name: '동심원',
		},
	];
	return (
		<>
			<Label htmlFor={id}>{name}</Label>
			{style === 'switch' && (
				<Switch id={id} onCheckedChange={value => changePanelValue(value)} />
			)}
			{style === 'slider' && (
				<div className="w-full">
					<Slider
						id={id}
						defaultValue={[checkPanelIdState as number]}
						onValueChange={value => changePanelValue(value[0])}
					/>
					<div>{checkPanelIdState}</div>
				</div>
			)}
			{style === 'select' && (
				<Select
					onValueChange={(value: keyof typeof SVGRenderTypes) =>
						changePanelValue(value)
					}
					defaultValue={selectList[1].id}>
					<SelectTrigger className="w-[180px]">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{selectList.map(({ id, name }) => (
							<SelectItem key={id} value={id}>
								{name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			)}
		</>
	);
}
