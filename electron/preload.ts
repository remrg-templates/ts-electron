import { contextBridge, ipcRenderer } from 'electron';
import type { DesktopApi } from './bridge';

const desktop: DesktopApi = {
	getAppInfo: () => ipcRenderer.invoke('app:get-info'),
};

contextBridge.exposeInMainWorld('desktop', desktop);
