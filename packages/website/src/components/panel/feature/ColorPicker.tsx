import { RgbaColorPicker } from 'react-colorful';
import './colorPicker.css';
import { useState } from 'react';

export default function ColorPicker() {
	const [color, setColor] = useState({ r: 200, g: 100, b: 0, a: 1 });
	const [isPickerVisible, setPickerVisible] = useState(false);

	function rgb(r: number, g: number, b: number): string {
		return `rgb(${r}, ${g}, ${b})`;
	}

	function getContrastColor(r: number, g: number, b: number): string {
		return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? 'black' : 'white';
	}

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
				{/* <p className="bg-[rgb(200,0,0)]">테스트</p> */}
			</p>
			{isPickerVisible && (
				<div
					style={{ position: 'absolute', zIndex: 1 }}
					onClick={event => event.stopPropagation()}>
					<RgbaColorPicker color={color} onChange={setColor} />
				</div>
			)}
		</div>
	);
}
