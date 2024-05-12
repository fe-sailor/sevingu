import { AccordionContent } from '../../ui/accordion';
import PanelElement from '../panelElement';
import { Controller } from '../panel';

export default function ImageControls() {
	const imageControls: Controller[] = [
		{ id: 'grayscale', name: '그레이스케일', style: 'switch' },
		{ id: 'invert', name: '반전', style: 'switch' },
		{ id: 'blur', name: '블러', style: 'slider', min: 0, max: 30 },
	];

	return (
		<>
			{imageControls.map(imageControl => (
				<PanelElement
					key={imageControl.id}
					panelType={'Image'}
					{...imageControl}
				/>
			))}
		</>
	);
}
