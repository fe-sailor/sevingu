import { SvgSettingSvgurt } from '@/lib/svg-renderers/svg-renderer-schema';

export class SevinguImage {
	#imageBlob: Blob;
	#timeStamp: number;
	#settingsStack: SvgSettingSvgurt[];
	#currentSettingIndex: number;

	constructor(imageBlob: Blob, initialSettings?: SvgSettingSvgurt) {
		this.#imageBlob = imageBlob;
		this.#timeStamp = Date.now();
		this.#settingsStack = initialSettings ? [initialSettings] : [];
		this.#currentSettingIndex = 0;
	}

	applySetting(newSetting: SvgSettingSvgurt) {
		this.#settingsStack = this.#settingsStack.slice(
			0,
			this.#currentSettingIndex + 1
		);
		this.#settingsStack.push(newSetting);
		this.#currentSettingIndex = this.#settingsStack.length - 1;
	}

	undoSetting() {
		if (this.#currentSettingIndex > 0) {
			this.#currentSettingIndex--;
		}
	}

	redoSetting() {
		if (this.#currentSettingIndex < this.#settingsStack.length - 1) {
			this.#currentSettingIndex++;
		}
	}

	getCurrentSetting(): SvgSettingSvgurt {
		return this.#settingsStack[this.#currentSettingIndex];
	}

	get imageBlob(): Blob {
		return this.#imageBlob;
	}

	get timeStamp(): number {
		return this.#timeStamp;
	}
}
