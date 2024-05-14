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
import { debounce } from 'lodash';
import { SvgSettingSvgurt } from '@/lib/svg-renderers/svg-renderer-schema';
import { CanvasSettingSvgurt } from '@/lib/canvas-filter/canvas-filter-schema';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '../ui/tooltip';
import LabelTooltip from './LabelTooltip';

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
			case 'image':
				return state.imagePanelState[id];
			case 'svg':
			default:
				return state.svgPanelState[id];
		}
	});

	const changePanelState = useStore(state => state.changePanelState);
	const changePanelValue = debounce(value => {
		changePanelState(panelType, [id, value]);
	}, 300);

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
		<div className="mb-1 flex items-center last:m-0 ">
			<div className="w-16">
				<LabelTooltip name={name}>
					<Label
						htmlFor={id}
						className="w-16 text-left text-xs tracking-tighter block overflow-hidden overflow-ellipsis whitespace-nowrap">
						{name}
					</Label>
				</LabelTooltip>
			</div>

			{style === 'switch' && (
				<Switch id={id} onCheckedChange={value => changePanelValue(value)} />
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
