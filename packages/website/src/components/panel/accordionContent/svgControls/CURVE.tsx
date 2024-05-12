import { AccordionContent } from '../../../ui/accordion';
import { Controller } from '../../panel';
import PanelElement from '../../panelElement';

export default function CURVE() {
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
		{ id: 'autoColor', name: '자동색상', style: 'switch' },
		{ id: 'strokeColor', name: '선 색상', style: 'switch' },
		{ id: 'strokeWidth', name: '선 너비', style: 'slider' },
		{
			id: 'strokeWidthRandomness',
			name: '선 너비 무작위',
			style: 'slider',
			max: 1,
			step: 0.01,
		},
		{ id: 'waves', name: '파동', style: 'slider', max: 50, step: 0.1 },
		{
			id: 'wavesRandomness',
			name: '파동 무작위',
			style: 'slider',
			max: 1,
			step: 0.01,
		},
		{ id: 'direction', name: '방향', style: 'slider', max: 360 },
		{
			id: 'directionRandomness',
			name: '방향 무작위',
			style: 'slider',
			max: 1,
			step: 0.01,
		},
		{ id: 'amplitude', name: '진폭', style: 'slider', max: 100, step: 0.1 },
		{
			id: 'amplitudeRandomness',
			name: '진폭 무작위',
			style: 'slider',
			max: 1,
			step: 0.01,
		},
		{ id: 'wavelength', name: '파장', style: 'slider', max: 100, step: 0.1 },
		{
			id: 'wavelengthRandomness',
			name: '바장 무작위',
			style: 'slider',
			max: 1,
			step: 0.01,
		},
	];

	return (
		<>
			{imageControls.map(imageControl => (
				<PanelElement
					key={imageControl.id}
					panelType={'Svg'}
					{...imageControl}
				/>
			))}
		</>
	);
}
