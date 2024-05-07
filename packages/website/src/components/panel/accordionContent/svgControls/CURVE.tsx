import { AccordionContent } from '../../../ui/accordion';
import { Controller } from '../../panel';
import PanelElement from '../../panelElement';

export default function CURVE() {
	const imageControls: Controller[] = [
		// { id: 'svgRenderType', name: 'svg렌더타입', style: 'select' },
		{ id: 'minColorRecognized', name: '최소 색상 인식', style: 'slider' },
		{ id: 'maxColorRecognized', name: '최대 색상 인식', style: 'slider' },
		{ id: 'renderEveryXPixels', name: 'X픽셀마다 렌더링', style: 'slider' },
		{ id: 'renderEveryYPixels', name: 'Y픽셀마다 렌더링', style: 'slider' },
		{ id: 'autoColor', name: '자동색상', style: 'switch' },
		{ id: 'strokeColor', name: '선 색상', style: 'switch' },
		{ id: 'strokeWidth', name: '선 너비', style: 'slider' },
		{ id: 'strokeWidthRandomness', name: '선 너비 무작위', style: 'slider' },
		{ id: 'waves', name: '파동', style: 'slider' },
		{ id: 'wavesRandomness', name: '파동 무작위', style: 'slider' },
		{ id: 'direction', name: '방향', style: 'slider' },
		{ id: 'amplitude', name: '진폭', style: 'slider' },
		{ id: 'amplitudeRandomness', name: '진폭 무작위', style: 'slider' },
		{ id: 'wavelength', name: '파장', style: 'slider' },
		{ id: 'wavelengthRandomness', name: '바장 무작위', style: 'slider' },
	];

	return (
		<>
			{imageControls.map(imageControl => (
				<PanelElement key={imageControl.id} {...imageControl} />
			))}
		</>
	);
}
