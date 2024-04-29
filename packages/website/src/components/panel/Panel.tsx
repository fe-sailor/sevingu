import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';

export default function Panel() {
	return (
		<Accordion type="multiple">
			<AccordionItem value="item-1">
				<AccordionTrigger>이미지 컨트롤</AccordionTrigger>
				<AccordionContent>
					<div className="flex items-center space-x-2">
						<Label htmlFor="airplane-mode">Airplane Mode</Label>
						<Switch id="airplane-mode" />
					</div>

					<Slider />
				</AccordionContent>
			</AccordionItem>
			<AccordionItem value="item-2">
				<AccordionTrigger>SVG 컨트롤</AccordionTrigger>
				<AccordionContent>
					<div className="flex items-center space-x-2">
						<Switch id="airplane-mode" />
						<Label htmlFor="airplane-mode">Airplane Mode</Label>
					</div>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}
