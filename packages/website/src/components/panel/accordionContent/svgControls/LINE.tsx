import { useStore } from '@/stores/store';
import { Controller } from '../../panel';
import PanelElement from '../../panelElement';

export default function LINE() {
	const storeState = useStore(state => state.svgPanelState);

	const imageControls: Controller[] = [
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
		{ id: 'continuous', name: '연속적', style: 'switch' },
		// continuous가 true일 때만 렌더링
		{
			id: 'minLineLength',
			name: '최소 선 길이',
			style: 'slider',
			min: 1,
			max: 50,
		},
		{ id: 'crossHatch', name: '교차 해칭', style: 'switch' },
		{
			id: 'amountOfLines',
			name: '선의 양',
			style: 'slider',
			min: 1,
			max: 5000,
		},
		// continuous가 false일 때만 렌더링
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
		{ id: 'lineLength', name: '선 길이', style: 'slider', max: 300 },
		{ id: 'lengthOnColor', name: '색상별 길이조절', style: 'switch' },
		{
			id: 'lengthRandomness',
			name: '길이 무작위',
			style: 'slider',
			max: 1,
			step: 0.01,
		},
		// 공통
		{ id: 'direction', name: '방향', style: 'slider', min: 1, max: 180 },
		{
			id: 'directionRandomness',
			name: '방향 무작위',
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
