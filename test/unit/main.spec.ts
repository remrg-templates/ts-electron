import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AppInfo } from '../../electron/bridge';

interface Sender {
	sender: unknown;
	senderFrame: unknown;
}

const mocks = vi.hoisted(() => {
	const mainFrame = {};
	const webContents = {
		mainFrame,
		setWindowOpenHandler: vi.fn(),
		on: vi.fn(),
	};
	const window = {
		webContents,
		loadFile: vi.fn().mockResolvedValue(undefined),
		loadURL: vi.fn().mockResolvedValue(undefined),
	};

	return {
		window,
		BrowserWindow: vi.fn(function () {
			return window;
		}),
		fromWebContents: vi.fn().mockReturnValue(window),
		handle:
			vi.fn<(channel: string, handler: (event: Sender) => AppInfo) => void>(),
		getName: vi.fn().mockReturnValue('Example'),
		getVersion: vi.fn().mockReturnValue('1.0.0'),
		setPermissionRequestHandler: vi.fn(),
		setPermissionCheckHandler: vi.fn(),
	};
});

vi.mock('electron', () => ({
	app: {
		whenReady: () => Promise.resolve(),
		isPackaged: true,
		getName: mocks.getName,
		getVersion: mocks.getVersion,
		on: vi.fn(),
		quit: vi.fn(),
		exit: vi.fn(),
	},
	BrowserWindow: Object.assign(mocks.BrowserWindow, {
		fromWebContents: mocks.fromWebContents,
		getAllWindows: () => [mocks.window],
	}),
	ipcMain: { handle: mocks.handle },
	session: {
		defaultSession: {
			setPermissionRequestHandler: mocks.setPermissionRequestHandler,
			setPermissionCheckHandler: mocks.setPermissionCheckHandler,
		},
	},
}));

describe('main process', () => {
	beforeEach(async () => {
		vi.clearAllMocks();
		vi.resetModules();
		mocks.fromWebContents.mockReturnValue(mocks.window);

		await import('../../electron/main');
	});

	it('creates an isolated window and loads bundled assets', () => {
		expect(mocks.BrowserWindow).toHaveBeenCalledWith(
			expect.objectContaining({
				webPreferences: expect.objectContaining({
					sandbox: true,
					contextIsolation: true,
					nodeIntegration: false,
				}),
			})
		);

		expect(mocks.window.loadFile).toHaveBeenCalledWith(
			expect.stringContaining('index.html')
		);
		expect(mocks.window.loadURL).not.toHaveBeenCalled();

		expect(mocks.window.webContents.setWindowOpenHandler).toHaveBeenCalledWith(
			expect.any(Function)
		);
		expect(mocks.setPermissionCheckHandler).toHaveBeenCalled();
	});

	it('restricts the IPC handler to the window main frame', () => {
		const handler = mocks.handle.mock.calls[0]?.[1];

		if (!handler) {
			throw new Error('App information IPC handler was not registered');
		}

		expect(mocks.handle.mock.calls[0]?.[0]).toBe('app:get-info');

		expect(
			handler({
				sender: {},
				senderFrame: mocks.window.webContents.mainFrame,
			})
		).toMatchObject({ name: 'Example', version: '1.0.0' });
		expect(() => handler({ sender: {}, senderFrame: {} })).toThrow(
			'only available to the main frame'
		);

		mocks.fromWebContents.mockReturnValue(null);

		expect(() =>
			handler({
				sender: {},
				senderFrame: mocks.window.webContents.mainFrame,
			})
		).toThrow('only available to the main frame');
	});
});
