import { AccordionContent } from '../../../ui/accordion';
import { Controller } from '../../panel';
import PanelElement from '../../panelElement';

export default function CIRCLE() {
	const imageControls: Controller[] = [
		// { id: 'svgRenderType', name: 'svg렌더타입', style: 'select' },
		{ id: 'minColorRecognized', name: '최소 색상 인식', style: 'slider' },
		{ id: 'maxColorRecognized', name: '최대 색상 인식', style: 'slider' },
		{ id: 'renderEveryXPixels', name: 'X픽셀마다 렌더링', style: 'slider' },
		{ id: 'renderEveryYPixels', name: 'Y픽셀마다 렌더링', style: 'slider' },
		{ id: 'fill', name: '채우기', style: 'switch' },
		{ id: 'fillColor', name: '채우기 색상', style: 'switch' },
		{ id: 'stroke', name: '선', style: 'switch' },
		{ id: 'radius', name: '반경', style: 'slider' },
		{ id: 'radiusOnColor', name: '색상 반경', style: 'switch' },
		{ id: 'radiusRandomness', name: '반경 무작위', style: 'slider' },
	];

	return (
		<>
			{imageControls.map(imageControl => (
				<PanelElement key={imageControl.id} {...imageControl} />
			))}
		</>
	);
}
