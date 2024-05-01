import { AccordionContent } from '../../ui/accordion';
import PanelElement from '../panelElement';
import { Controller } from '../panel';

export default function Posterize() {
	const imageControls: Controller[] = [
		{ id: 'posterize', name: '포스터화', style: 'switch' },
		{ id: 'posterizeLevels', name: '포스터화 수준', style: 'slider' },
	];

	return (
		<AccordionContent>
			{imageControls.map(imageControl => (
				<PanelElement key={imageControl.id} {...imageControl} />
			))}
		</AccordionContent>
	);
}
