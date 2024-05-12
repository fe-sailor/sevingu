import { PanelEntries, useStore } from '@/stores/store';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Slider } from '../ui/slider';
import { Controller, ElementStyle, PanelType, SVGRenderTypes } from './panel';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../ui/select';
import { PanelState, PanelStateKey } from '@/stores/storeType';
import { RgbaColorPicker } from 'react-colorful';
import ColorPicker from './feature/ColorPicker';
import { SvgSettingSvgurt } from '@/lib/svg-renderers/svg-renderer-schema';

type Props = {
	panelType: PanelType;
} & Controller;

export default function PanelElement({
	panelType,
	id,
	name,
	style,
	min = 0,
	max = 100,
	step = 1,
}: Props) {
	const checkPanelIdState = useStore(state => {
		switch (panelType) {
			case 'Image':
				return state.ImagePanelState[id];
			case 'Svg':
			default:
				return state.SvgPanelState[id];
		}
	});

	console.log(id, checkPanelIdState);
	const changePanelState = useStore(state => state.changePanelState);
	const changePanelValue = (
		value // boolean | number | keyof typeof SVGRenderTypes
	) => {
		changePanelState(panelType, [id, value]);
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
		<div className="mb-4 last:m-0 ">
			<Label htmlFor={id} className="block mb-2">
				{name}
			</Label>
			{style === 'switch' && (
				<Switch
					id={id}
					// className="h-3"
					onCheckedChange={value => changePanelValue(value)}
				/>
			)}
			{style === 'slider' && (
				<div className="w-full flex">
					<Slider
						id={id}
						min={min}
						max={max}
						step={step}
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
			{style === 'color' && <ColorPicker />}
		</div>
	);
}
