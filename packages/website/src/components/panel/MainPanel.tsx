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
import { Rnd } from 'react-rnd';

const ACCORDION_TITLE = 'p-1 bg-[#c5f6fa] text-sm font-bold';

export default function MainPanel() {
	const checkSvgPanelState = useStore(state => state.svgPanelState);
	const changePanelState = useStore(state => state.changePanelState);

	const [svgSelect, setSvgSelect] = useState<keyof typeof SVGRenderTypes>(
		checkSvgPanelState.svgRenderType
	);

	const changePanelValue = (value: keyof typeof SVGRenderTypes) => {
		changePanelState('svg', ['svgRenderType', value]);
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
		<Rnd
			// ref: https://github.com/bokuweb/react-rnd
			default={{
				x: 0,
				y: 0,
				width: 280,
				height: 20,
			}}
			enableResizing={false}
			className="bg-slate-200 z-10 rounded-t-xl">
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-1.5 w-16 bg-slate-100 rounded-full"></div>
			<div className="h-5"></div>
			<div className="bg-white">
				<Accordion type="multiple">
					<AccordionItem value="item-1">
						<AccordionTrigger className={ACCORDION_TITLE}>
							이미지 컨트롤
						</AccordionTrigger>
						<AccordionContent className="p-2">
							<ImageControls />
							{/* 테스트 */}
							{/* <AccordionItem value="item-1-1">
								<AccordionTrigger className={ACCORDION_TITLE}>
									이미지 컨트롤
								</AccordionTrigger>
								<AccordionContent className="p-4">
									<ImageControls />
								</AccordionContent>
							</AccordionItem> */}
							{/* 테스트 */}

							<AccordionItem value="item-2">
								<AccordionTrigger className={ACCORDION_TITLE}>
									포스터화(Posterize)
								</AccordionTrigger>
								<AccordionContent className="p-2">
									<Posterize />
								</AccordionContent>
							</AccordionItem>

							<AccordionItem value="item-3">
								<AccordionTrigger className={ACCORDION_TITLE}>
									가장자리 감지
								</AccordionTrigger>
								<AccordionContent className="p-2">
									<EdgeDetection />
								</AccordionContent>
							</AccordionItem>
						</AccordionContent>
					</AccordionItem>

					<AccordionItem value="item-4">
						<AccordionTrigger className={ACCORDION_TITLE}>
							SVG 컨트롤
						</AccordionTrigger>
						<AccordionContent className="p-2">
							{/* svg 타입 선택 */}
							<div className="flex items-center space-x-2 mb-21">
								<Label htmlFor={'svgRenderType'} className="block mb-2 text-xs">
									svg렌더타입
								</Label>
								<Select
									onValueChange={(value: keyof typeof SVGRenderTypes) =>
										changePanelValue(value)
									}
									defaultValue={svgSelectList[1].id}>
									<SelectTrigger className="w-[40%]">
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
		</Rnd>
	);
}
