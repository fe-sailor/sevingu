import { useStore } from '@/stores/store';
import { Controller } from '../../panel';
import PanelElement from '../../PanelElement';

export default function CURVE() {
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
			name: '렌더링 (X)',
			style: 'slider',
			min: 1,
			max: 50,
		},
		{
			id: 'renderEveryYPixels',
			name: '렌더링 (Y)',
			style: 'slider',
			min: 1,
			max: 50,
		},
		{ id: 'autoColor', name: '자동색상', style: 'switch' },
		{
			id: 'strokeColor',
			name: '선 색상',
			style: 'color',
			dependentOn: 'autoColor',
			isShowDependentState: false,
		},
		{ id: 'strokeWidth', name: '선 너비', style: 'slider' },
		{
			id: 'strokeWidthRandomness',
			name: '선 너비 무작위',
			style: 'slider',
			max: 1,
			step: 0.01,
		},
		{ id: 'waves', name: '파동', style: 'slider', max: 50, step: 0.1 },
		{
			id: 'wavesRandomness',
			name: '파동 무작위',
			style: 'slider',
			max: 1,
			step: 0.01,
		},
		{ id: 'direction', name: '방향', style: 'slider', max: 360 },
		{
			id: 'directionRandomness',
			name: '방향 무작위',
			style: 'slider',
			max: 1,
			step: 0.01,
		},
		{ id: 'amplitude', name: '진폭', style: 'slider', max: 100, step: 0.1 },
		{
			id: 'amplitudeRandomness',
			name: '진폭 무작위',
			style: 'slider',
			max: 1,
			step: 0.01,
		},
		{ id: 'wavelength', name: '파장', style: 'slider', max: 100, step: 0.1 },
		{
			id: 'wavelengthRandomness',
			name: '바장 무작위',
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
