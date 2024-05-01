import { AccordionContent } from '../../ui/accordion';
import PanelElement from '../panelElement';
import { Controller } from '../panel';

export default function EdgeDetection() {
	const imageControls: Controller[] = [
		{ id: 'edgeDetection', name: '가장자리 감지', style: 'switch' },
		{ id: 'lowThreshold', name: '낮은 임계값', style: 'slider' },
		{ id: 'highThreshold', name: '높은 임계값', style: 'slider' },
	];

	return (
		<AccordionContent>
			{imageControls.map(imageControl => (
				<PanelElement key={imageControl.id} {...imageControl} />
			))}
		</AccordionContent>
	);
}
