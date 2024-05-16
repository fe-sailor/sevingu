import PanelElement from '../PanelElement';
import { Controller } from '../panel';

export default function Posterize() {
	const imageControls: Controller[] = [
		{ id: 'posterize', name: '포스터화', style: 'switch' },
		{
			id: 'posterizeLevels',
			name: '포스터화 레벨',
			style: 'slider',
			min: 1,
			max: 30,
		},
	];

	return (
		<>
			{imageControls.map(imageControl => (
				<PanelElement
					key={imageControl.id}
					panelType={'image'}
					{...imageControl}
				/>
			))}
		</>
	);
}
