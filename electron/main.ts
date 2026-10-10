import { app, BrowserWindow, ipcMain, session } from 'electron';
import { join } from 'node:path';
import type { AppInfo } from './bridge';

function createWindow(): void {
	const window = new BrowserWindow({
		width: 1024,
		height: 768,
		webPreferences: {
			preload: join(__dirname, '../preload/index.js'),
			contextIsolation: true,
			nodeIntegration: false,
			sandbox: true,
		},
	});

	window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
	window.webContents.on('will-navigate', (event) => event.preventDefault());
	window.webContents.on('will-attach-webview', (event) =>
		event.preventDefault()
	);

	const url = process.env['ELECTRON_RENDERER_URL'];
	const loading =
		!app.isPackaged && url
			? window.loadURL(url)
			: window.loadFile(join(__dirname, '../renderer/index.html'));

	void loading.catch((error: unknown) => {
		process.stderr.write(`Failed to load renderer: ${String(error)}\n`);
		app.exit(1);
	});
}

void app
	.whenReady()
	.then(() => {
		session.defaultSession.setPermissionRequestHandler(
			(_webContents, _permission, callback) => callback(false)
		);
		session.defaultSession.setPermissionCheckHandler(() => false);

		ipcMain.handle('app:get-info', (event): AppInfo => {
			const window = BrowserWindow.fromWebContents(event.sender);

			if (!window || event.senderFrame !== window.webContents.mainFrame) {
				throw new Error('App information is only available to the main frame');
			}

			return {
				name: app.getName(),
				version: app.getVersion(),
				electron: process.versions.electron,
			};
		});

		createWindow();

		app.on('activate', () => {
			if (BrowserWindow.getAllWindows().length === 0) {
				createWindow();
			}
		});
	})
	.catch((error: unknown) => {
		process.stderr.write(`Failed to initialize Electron: ${String(error)}\n`);
		app.exit(1);
	});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});
