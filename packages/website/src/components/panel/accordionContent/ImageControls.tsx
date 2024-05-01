import { AccordionContent } from '../../ui/accordion';
import PanelElement from '../panelElement';
import { Controller } from '../panel';

export default function ImageControls() {
	const imageControls: Controller[] = [
		{ id: 'grayscale', name: '흑백', style: 'switch' },
		{ id: 'invert', name: '반전', style: 'switch' },
		{ id: 'blur', name: '흐리게', style: 'slider' },
	];

	return (
		<AccordionContent>
			{imageControls.map(imageControl => (
				<PanelElement key={imageControl.id} {...imageControl} />
			))}
		</AccordionContent>
	);
}
