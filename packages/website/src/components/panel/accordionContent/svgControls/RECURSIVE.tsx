import { Controller } from '../../panel';
import PanelElement from '../../PanelElement';

export default function RECURSIVE() {
	const imageControls: Controller[] = [
		{
			id: 'minColorRecognized',
			name: '최소 색상 인식',
			style: 'slider',
			max: 255,
		},
		{
			id: 'maxColorRecognized',
			name: '최대 색상 인식',
			style: 'slider',
			max: 255,
		},
		{
			id: 'renderEveryXPixels',
			name: 'X픽셀마다 렌더링',
			style: 'slider',
			min: 1,
			max: 50,
		},
		{
			id: 'renderEveryYPixels',
			name: 'Y픽셀마다 렌더링',
			style: 'slider',
			min: 1,
			max: 50,
		},
		{
			id: 'strokeColor',
			name: '선 색상',
			style: 'color',
		},
		{
			id: 'strokeWidth',
			name: '선 너비',
			style: 'slider',
			max: 100,
		},
		{
			id: 'strokeWidthRandomness',
			name: '선 너비 무작위',
			style: 'slider',
			max: 1,
			step: 0.01,
		},
		{
			id: 'recursiveAlgorithm',
			name: '재귀 알고리즘',
			style: 'select',
			selectList: [
				{ id: 'A', name: '첫번째' },
				{ id: 'B', name: '두번째' },
				{ id: 'C', name: '세번째' },
				{ id: 'D', name: '네번째' },
				{ id: 'E', name: '다섯번째' },
			],
		},
		{
			id: 'maxRecursiveDepth',
			name: '최대 재귀 깊이',
			style: 'slider',
			min: 1,
			max: 1000,
		},
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
