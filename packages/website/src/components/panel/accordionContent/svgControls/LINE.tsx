import { useStore } from '@/stores/store';
import { Controller } from '../../panel';
import PanelElement from '../../PanelElement';

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
			dependentOn: 'stroke',
			dependentOn2: 'autoColor',
			isShowDependentState: true,
			isShowDependent2State: false,
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
			id: 'minlineLength',
			name: '최소 선 길이',
			style: 'slider',
			min: 1,
			max: 50,
			dependentOn: 'continuous',
			isShowDependentState: true,
		},
		{
			id: 'crossHatch',
			name: '교차 해칭',
			style: 'switch',
			dependentOn: 'continuous',
			isShowDependentState: true,
		},
		{
			id: 'amountOfLines',
			name: '선의 양',
			style: 'slider',
			min: 1,
			max: 5000,
			dependentOn: 'continuous',
			isShowDependentState: true,
		},
		// continuous가 false일 때만 렌더링
		{
			id: 'renderEveryXPixels',
			name: 'X픽셀마다 렌더링',
			style: 'slider',
			min: 1,
			max: 50,
			dependentOn: 'continuous',
			isShowDependentState: false,
		},
		{
			id: 'renderEveryYPixels',
			name: 'Y픽셀마다 렌더링',
			style: 'slider',
			min: 1,
			max: 50,
			dependentOn: 'continuous',
			isShowDependentState: false,
		},
		{
			id: 'lineLength',
			name: '선 길이',
			style: 'slider',
			max: 300,
			dependentOn: 'continuous',
			isShowDependentState: false,
		},
		{
			id: 'lengthOnColor',
			name: '색상별 길이조절',
			style: 'switch',
			dependentOn: 'continuous',
			isShowDependentState: false,
		},
		{
			id: 'lengthRandomness',
			name: '길이 무작위',
			style: 'slider',
			max: 1,
			step: 0.01,
			dependentOn: 'continuous',
			isShowDependentState: false,
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
				const {
					dependentOn,
					isShowDependentState,
					dependentOn2,
					isShowDependent2State,
					...otherProps
				} = imageControl;

				const dependencies = [
					{ dependentOn, isShowDependentState },
					{
						dependentOn: dependentOn2,
						isShowDependentState: isShowDependent2State,
					},
				];

				const shouldRender = dependencies.every(
					({ dependentOn, isShowDependentState }) =>
						!dependentOn || isShowDependentState === storeState[dependentOn]
				);

				if (shouldRender) {
					return (
						<PanelElement
							key={otherProps.id}
							panelType={'svg'}
							{...otherProps}
						/>
					);
				}
			})}
		</>
	);
}
