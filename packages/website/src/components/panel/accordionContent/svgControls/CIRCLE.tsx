import { AccordionContent } from '../../../ui/accordion';
import { Controller } from '../../panel';
import PanelElement from '../../panelElement';

export default function CIRCLE() {
	const imageControls: Controller[] = [
		// { id: 'svgRenderType', name: 'svg렌더타입', style: 'select' },
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
		{ id: 'fill', name: '채우기', style: 'switch' },
		{ id: 'fillColor', name: '채우기 색상', style: 'color' },
		{ id: 'stroke', name: '선', style: 'switch' },
		{ id: 'radius', name: '반경', style: 'slider', max: 50 },
		{ id: 'radiusOnColor', name: '색상 반경', style: 'switch' },
		{
			id: 'radiusRandomness',
			name: '반경 무작위',
			style: 'slider',
			max: 1,
			step: 0.01,
		},
	];

	return (
		<>
			{imageControls.map(imageControl => (
				<PanelElement key={imageControl.id} panelType="Svg" {...imageControl} />
			))}
		</>
	);
}
