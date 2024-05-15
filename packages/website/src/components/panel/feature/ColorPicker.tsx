import { RgbaColorPicker } from 'react-colorful';
import './colorPicker.css';
import { useState } from 'react';
import { useStore } from '@/stores/store';
import { debounce } from 'lodash';
import { SvgSettingSvgurt } from '@/lib/svg-renderers/svg-renderer-schema';

type Props = {
	id: keyof SvgSettingSvgurt;
};

export default function ColorPicker({ id }: Props) {
	const changePanelState = useStore(state => state.changePanelState);
	const [color, setColor] = useState({ r: 28, g: 32, b: 28, a: 1 });
	const [isPickerVisible, setPickerVisible] = useState(false);

	function rgb(r: number, g: number, b: number): string {
		return `rgb(${r}, ${g}, ${b})`;
	}

	function getContrastColor(r: number, g: number, b: number): string {
		return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? 'black' : 'white';
	}

	const changePanelValue = debounce(() => {
		changePanelState('svg', [id, rgb(color.r, color.g, color.b)]);
		console;
	}, 300);

	return (
		<div
			onMouseEnter={() => setPickerVisible(true)}
			onMouseLeave={() => setPickerVisible(false)}>
			<p
				style={{
					backgroundColor: rgb(color.r, color.g, color.b),
					color: getContrastColor(color.r, color.g, color.b),
					position: 'relative',
				}}>
				rgb({color.r}, {color.g}, {color.b})
			</p>
			{isPickerVisible && (
				<div
					style={{ position: 'absolute', zIndex: 1 }}
					onMouseDown={event => event.stopPropagation()}>
					<RgbaColorPicker
						color={color}
						onChange={newColor => {
							setColor(newColor);
							changePanelValue();
						}}
					/>
				</div>
			)}
		</div>
	);
}
