export interface AppInfo {
	name: string;
	version: string;
	electron: string;
}

export interface DesktopApi {
	getAppInfo(): Promise<AppInfo>;
}
