import type { DesktopApi } from '../electron/bridge';

declare global {
	interface Window {
		desktop?: DesktopApi;
	}
}
