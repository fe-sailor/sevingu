import { useStore } from '@/stores/store';
import { Controller } from '../../panel';
import PanelElement from '../../panelElement';

export default function CIRCLE() {
	const storeState = useStore(state => state.svgPanelState);

	const imageControls: Controller[] = [
		// { id: 'svgRenderType', name: 'svg렌더타입', style: 'select' },
		{
			id: 'minColorRecognized',
			name: '최소 색상 인식',
			style: 'slider',
			max: 255,
		},
		{
			id: 'maxColorRecognized',
			name: '최대 색상 인식',
			style: 'slider',
			max: 255,
		},
		{
			id: 'renderEveryXPixels',
			name: 'X픽셀마다 렌더링',
			style: 'slider',
			min: 1,
			max: 50,
		},
		{
			id: 'renderEveryYPixels',
			name: 'Y픽셀마다 렌더링',
			style: 'slider',
			min: 1,
			max: 50,
		},
		{ id: 'fill', name: '채우기', style: 'switch' },
		{
			id: 'fillColor',
			name: '채우기 색상',
			style: 'color',
			dependentOn: 'fill',
			isShowDependentState: true,
		},
		{ id: 'stroke', name: '선', style: 'switch' },
		{
			id: 'autoColor',
			name: '자동 색상',
			style: 'switch',
			dependentOn: 'stroke',
			isShowDependentState: true,
		},
		{
			id: 'strokeColor',
			name: '선 색상',
			style: 'color',
			dependentOn: 'autoColor',
			isShowDependentState: false,
		},
		{
			id: 'strokeWidth',
			name: '선 너비',
			style: 'slider',
			max: 100,
			dependentOn: 'stroke',
			isShowDependentState: true,
		},
		{
			id: 'strokeWidthRandomness',
			name: '선 너비 무작위',
			style: 'slider',
			max: 1,
			step: 0.01,
			dependentOn: 'stroke',
			isShowDependentState: true,
		},
		{ id: 'radius', name: '반경', style: 'slider', max: 50 },
		{ id: 'radiusOnColor', name: '색상 반경', style: 'switch' },
		{
			id: 'radiusRandomness',
			name: '반경 무작위',
			style: 'slider',
			max: 1,
			step: 0.01,
		},
	];

	return (
		<>
			{imageControls.map(imageControl => {
				const { dependentOn, isShowDependentState, ...otherProps } =
					imageControl;
				// dependentOn이 있으면
				// isShowDependentState가 스토어값과 같을 때, 해당 값을 렌더합니다.
				if (dependentOn) {
					if (isShowDependentState === storeState[dependentOn]) {
						return (
							<PanelElement
								key={otherProps.id}
								panelType={'svg'}
								{...otherProps}
							/>
						);
					}
				} else {
					return (
						<PanelElement
							key={imageControl.id}
							panelType={'svg'}
							{...imageControl}
						/>
					);
				}
			})}
		</>
	);
}
