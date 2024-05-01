import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { z } from 'zod';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const rgbRegex =
	/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/;

export const rgbValidator = z.string().refine(
	value => {
		const match = value.match(rgbRegex);
		if (!match) {
			return false;
		}

		return match.slice(1).every(num => {
			const n = parseInt(num, 10);
			return n >= 0 && n <= 255;
		});
	},
	{
		message: 'Invalid RGB format',
	}
);
