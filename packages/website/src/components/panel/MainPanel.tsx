import {
	Accordion,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion';
import { useStore } from '@/stores/store';
import { PanelStateKey } from '@/stores/storeType';
import EdgeDetection from './accordionContent/EdgeDetection';
import ImageControls from './accordionContent/ImageControls';
import Posterize from './accordionContent/Posterize';
import SVGControls from './accordionContent/SVGControls';

export default function MainPanel() {
	const checkPanelState = useStore(state => state.panelState);
	const changePanelState = useStore(state => state.changePanelState);
	console.log(checkPanelState);
	const changePanelValue = (key: PanelStateKey, value: boolean | number) => {
		changePanelState(key, value);
	};
	return (
		<Accordion type="multiple">
			<AccordionItem value="item-1">
				<AccordionTrigger>이미지 컨트롤</AccordionTrigger>
				<ImageControls />
			</AccordionItem>
			<AccordionItem value="item-2">
				<AccordionTrigger>포스터화(Posterize)</AccordionTrigger>
				<Posterize />
			</AccordionItem>
			<AccordionItem value="item-3">
				<AccordionTrigger>가장자리 감지</AccordionTrigger>
				<EdgeDetection />
			</AccordionItem>
			<AccordionItem value="item-4">
				<AccordionTrigger>SVG 컨트롤</AccordionTrigger>
				<SVGControls />
			</AccordionItem>
		</Accordion>
	);
}
