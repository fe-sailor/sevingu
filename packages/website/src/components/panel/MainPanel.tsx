import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion';
import { CONTROLLER_BOUNDARY_SELECTOR } from '@/constants';
import { useStore } from '@/stores/store';
import { SVGRenderTypes } from '@/stores/storeType';
import { throttle } from 'lodash';
import { createElement, useEffect, useRef, useState } from 'react';
import { Rnd } from 'react-rnd';
import { Label } from '../ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../ui/select';
import EdgeDetection from './accordionContent/EdgeDetection';
import ImageControls from './accordionContent/ImageControls';
import Posterize from './accordionContent/Posterize';
import CIRCLE from './accordionContent/svgControls/CIRCLE';
import CURVE from './accordionContent/svgControls/CURVE';
import LINE from './accordionContent/svgControls/LINE';
import RECURSIVE from './accordionContent/svgControls/RECURSIVE';


const ACCORDION_TITLE = 'p-1 bg-[#c5f6fa] text-sm font-bold';

export default function MainPanel() {
	const { defaultWidth, defaultHeight } = {
		defaultWidth: 280,
		defaultHeight: 20,
	} as const;
	const [position, setPosition] = useState({ x: 1232, y: 64 });
	const positionRef = useRef(position);
	const screenSizeRef = useRef({ width: 0, height: 0 });

	useEffect(() => {
		const viewerElement = document.querySelector('.w-screen') as HTMLElement;
		if (viewerElement) {
			screenSizeRef.current = {
				width: viewerElement.offsetWidth,
				height: viewerElement.offsetHeight,
			};

			const handleResize = throttle(() => {
				const deltaX = viewerElement.offsetWidth - screenSizeRef.current.width;
				const deltaY =
					viewerElement.offsetHeight - screenSizeRef.current.height;

				const newPos = {
					x: positionRef.current.x + deltaX,
					y: positionRef.current.y + deltaY,
				};

				// viewerElement 내에서 패널이 벗어나지 않도록 조정
				newPos.x = Math.max(
					0,
					Math.min(newPos.x, viewerElement.offsetWidth - defaultWidth)
				);
				newPos.y = Math.max(
					0,
					Math.min(newPos.y, viewerElement.offsetHeight - defaultHeight)
				);

				setPosition(newPos);
				positionRef.current = newPos;
				screenSizeRef.current = {
					width: viewerElement.offsetWidth,
					height: viewerElement.offsetHeight,
				};
			}, 50);

			handleResize();

			window.addEventListener('resize', handleResize);
			return () => window.removeEventListener('resize', handleResize);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

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
		[SVGRenderTypes.LINE]: LINE,
		[SVGRenderTypes.RECURSIVE]: RECURSIVE,
		// 다른 SVGRenderTypes에 대한 컴포넌트를 여기에 추가하세요.
	};

	return (
		<Rnd
			// ref: https://github.com/bokuweb/react-rnd
			size={{
				width: defaultWidth,
				height: defaultHeight,
			}}
			position={position}
			bounds={CONTROLLER_BOUNDARY_SELECTOR}
			enableResizing={false}
			onDragStop={(e, d) => {
				setPosition({ x: d.x, y: d.y });
				positionRef.current = { x: d.x, y: d.y };
			}}
			className={'z-10 rounded-t-xl bg-amber-100'}>
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-2 w-20 bg-white/90 rounded-full"></div>
			<div className="h-5"></div>
			<div className="border-solid border-4 rounded-b bg-amber-100 border-amber-100">
				<div className="rounded-lg overflow-hidden bg-white">
					<Accordion type="multiple">
						<AccordionItem value="item-1">
							<AccordionTrigger className={ACCORDION_TITLE}>
								이미지 컨트롤
							</AccordionTrigger>

							<AccordionContent className="p-2">
								<ImageControls />
								<AccordionItem
									value="item-2"
									className="rounded-t overflow-hidden">
									<AccordionTrigger className={ACCORDION_TITLE}>
										포스터화(Posterize)
									</AccordionTrigger>
									<AccordionContent className="p-2">
										<Posterize />
									</AccordionContent>
								</AccordionItem>
								<div className="h-0.5"></div>
								<AccordionItem
									value="item-3"
									className="rounded-b overflow-hidden">
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
								<div className="flex items-center space-x-2">
									<Label
										htmlFor={'svgRenderType'}
										className="block mb-2 text-xs">
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
			</div>
		</Rnd>
	);
}
