import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion';
import { PanelEntries, useStore } from '@/stores/store';
import { PanelStateKey, SVGRenderTypes } from '@/stores/storeType';
import EdgeDetection from './accordionContent/EdgeDetection';
import ImageControls from './accordionContent/ImageControls';
import Posterize from './accordionContent/Posterize';
import CIRCLE from './accordionContent/svgControls/CIRCLE';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../ui/select';
import { Label } from '../ui/label';
import { createElement, useState } from 'react';
import CURVE from './accordionContent/svgControls/CURVE';

const ACCORDION_TITLE = 'p-2 bg-[#c5f6fa] font-bold';

export default function MainPanel() {
	const checkPanelState = useStore(state => state.panelState);
	const changePanelState = useStore(state => state.changePanelState);
	console.log(checkPanelState);

	const [svgSelect, setSvgSelect] = useState<keyof typeof SVGRenderTypes>(
		checkPanelState.svgRenderType
	);

	const changePanelValue = (value: keyof typeof SVGRenderTypes) => {
		changePanelState(['svgRenderType', value]);
		setSvgSelect(value);
	};

	const svgSelectList = [
		{
			id: SVGRenderTypes.TRACE,
			name: '추적',
		},
		{
			id: SVGRenderTypes.CIRCLE,
			name: '원',
		},
		{
			id: SVGRenderTypes.CURVE,
			name: '곡선',
		},
		{
			id: SVGRenderTypes.LINE,
			name: '선',
		},
		{
			id: SVGRenderTypes.RECURSIVE,
			name: '반복',
		},
		{
			id: SVGRenderTypes.CONCENTRIC,
			name: '동심원',
		},
	];

	const SVG_COMPONENTS = {
		[SVGRenderTypes.CIRCLE]: CIRCLE,
		[SVGRenderTypes.CURVE]: CURVE,
		// 다른 SVGRenderTypes에 대한 컴포넌트를 여기에 추가하세요.
	};

	return (
		<div className="bg-white w-1/3 ">
			<Accordion type="multiple">
				<AccordionItem value="item-1">
					<AccordionTrigger className={ACCORDION_TITLE}>
						이미지 컨트롤
					</AccordionTrigger>
					<AccordionContent className="p-4">
						<ImageControls />
					</AccordionContent>
				</AccordionItem>

				<AccordionItem value="item-2">
					<AccordionTrigger className={ACCORDION_TITLE}>
						포스터화(Posterize)
					</AccordionTrigger>
					<AccordionContent className="p-4">
						<Posterize />
					</AccordionContent>
				</AccordionItem>

				<AccordionItem value="item-3">
					<AccordionTrigger className={ACCORDION_TITLE}>
						가장자리 감지
					</AccordionTrigger>
					<AccordionContent className="p-4">
						<EdgeDetection />
					</AccordionContent>
				</AccordionItem>

				<AccordionItem value="item-4">
					<AccordionTrigger className={ACCORDION_TITLE}>
						SVG 컨트롤
					</AccordionTrigger>
					<AccordionContent className="p-4">
						{/* svg 타입 선택 */}
						<div className="flex items-center items-center space-x-2 mb-4">
							<Label htmlFor={'svgRenderType'} className="block mb-2">
								svg렌더타입
							</Label>
							<Select
								onValueChange={(value: keyof typeof SVGRenderTypes) =>
									changePanelValue(value)
								}
								defaultValue={svgSelectList[1].id}>
								<SelectTrigger className="w-[180px]">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{svgSelectList.map(({ id, name }) => (
										<SelectItem key={id} value={id}>
											{name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{SVG_COMPONENTS[svgSelect] &&
							createElement(SVG_COMPONENTS[svgSelect])}
					</AccordionContent>
				</AccordionItem>
			</Accordion>
		</div>
	);
}
