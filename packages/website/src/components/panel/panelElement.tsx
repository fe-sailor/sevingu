import { useStore } from '@/stores/store';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Slider } from '../ui/slider';
import { Controller } from './panel';

export default function PanelElement({ id, name, style }: Controller) {
	const checkPanelIdState = useStore(state => state.panelState[id]);
	const changePanelState = useStore(state => state.changePanelState);
	const changePanelValue = (value: boolean | number) => {
		changePanelState(id, value);
	};

	return (
		<div className="flex items-center space-x-2">
			<Label htmlFor={id}>{name}</Label>
			{style === 'switch' && (
				<Switch id={id} onCheckedChange={value => changePanelValue(value)} />
			)}
			{style === 'slider' && (
				<div className="w-full">
					<Slider
						id="blur"
						defaultValue={[checkPanelIdState as number]}
						onValueChange={value => changePanelValue(value[0])}
					/>
					<div>{checkPanelIdState}</div>
				</div>
			)}
		</div>
	);
}
