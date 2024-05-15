import { Controller } from '../../panel';
import PanelElement from '../../PanelElement';

export default function CONCENTRIC() {
	const imageControls: Controller[] = [
		{
			id: 'strokeColor',
			name: '선 색상',
			style: 'color',
		},
		{
			id: 'strokeWidth',
			name: '선 너비',
			style: 'slider',
			min: 0,
			max: 100,
		},
		{
			id: 'strokeWidthRandomness',
			name: '선 너비 무작위',
			style: 'slider',
			min: 0,
			max: 1,
			step: 0.01,
		},
		{
			id: 'circleArcs',
			name: '원 둥근 모양',
			style: 'slider',
			min: 2,
			max: 400,
		},
		{
			id: 'intensityWeight',
			name: '강도 가중치',
			style: 'slider',
			min: 500,
			max: 1000000,
		},
		{ id: 'radiusStep', name: '반경 단계', style: 'slider', max: 100 },
	];

	return (
		<>
			{imageControls.map(imageControl => (
				<PanelElement
					key={imageControl.id}
					panelType={'svg'}
					{...imageControl}
				/>
			))}
		</>
	);
}
