import { useStore } from '@/stores/store';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Slider } from '../ui/slider';
import { Controller, PanelType } from './panel';
import ColorPicker from './feature/ColorPicker';
import { debounce } from 'lodash';
import LabelTooltip from './feature/LabelTooltip';
import { SvgSettingSvgurt } from '@sevingu/core';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../ui/select';

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
	selectList = [{ id: 'default', name: 'default' }],
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

	const isReverseSlider = (id: string) =>
		['renderEveryXPixels', 'renderEveryYPixels'].includes(id);
	const revertValue = (num: number) => 50 - num + 1;
	const handleSliderChange = (id: Controller['id'], value: number) => {
		const adjustValue = isReverseSlider(id) ? revertValue(value) : value;
		changePanelValue(adjustValue);
	};

	const getSliderShowingValue = () => {
		if (isReverseSlider(id) && typeof checkPanelIdState === 'number') {
			return revertValue(checkPanelIdState);
		}
		return checkPanelIdState;
	};

	return (
		<div className="mb-1 flex items-center last:m-0 ">
			<div className="w-20">
				<LabelTooltip name={name}>
					<Label
						htmlFor={id}
						className="w-20 text-left text-xs tracking-tighter block overflow-hidden overflow-ellipsis whitespace-nowrap">
						{name}
					</Label>
				</LabelTooltip>
			</div>

			{style === 'switch' && (
				<Switch
					id={id}
					defaultChecked={checkPanelIdState as boolean}
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
						defaultValue={[getSliderShowingValue()]}
						onValueChange={value => handleSliderChange(id, value[0])}
					/>
					<div>{getSliderShowingValue()}</div>
				</div>
			)}
			{style === 'select' && (
				<Select
					onValueChange={value => changePanelValue(value)}
					defaultValue={checkPanelIdState}>
					<SelectTrigger className="w-[40%]">
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
			{style === 'color' && <ColorPicker id={id as keyof SvgSettingSvgurt} />}
		</div>
	);
}
