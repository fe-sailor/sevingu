import { RgbaColorPicker } from 'react-colorful';
import './colorPicker.css';
import { useState } from 'react';

export default function ColorPicker() {
	const [color, setColor] = useState({ r: 200, g: 100, b: 0, a: 1 });

	function rgb(r: number, g: number, b: number): string {
		return `rgb(${r}, ${g}, ${b})`;
	}

	return (
		<p className={`bg-[rgb(${color.r},${color.g},${color.b})]`}>
			rgb({color.r}, {color.g}, {color.b})
			{/* <p className="bg-[rgb(200,0,0)]">테스트</p> */}
		</p>
		// <input type="color" value={color} onChange={setColor} />
		// <RgbaColorPicker color={color} onChange={setColor} />
	);
}
