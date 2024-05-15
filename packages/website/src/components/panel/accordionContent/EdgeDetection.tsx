import { AccordionContent } from '../../ui/accordion';
import PanelElement from '../PanelElement';
import { Controller } from '../panel';

export default function EdgeDetection() {
	const imageControls: Controller[] = [
		{ id: 'edgeDetection', name: '엣지 검출', style: 'switch' },
		{ id: 'lowThreshold', name: '낮은 임계값', style: 'slider' },
		{ id: 'highThreshold', name: '높은 임계값', style: 'slider' },
	];

	return (
		<AccordionContent>
			{imageControls.map(imageControl => (
				<PanelElement
					key={imageControl.id}
					panelType={'image'}
					{...imageControl}
				/>
			))}
		</AccordionContent>
	);
}
