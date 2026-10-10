import { describe, expect, it, vi } from 'vitest';
import type { DesktopApi } from '../../electron/bridge';

const mocks = vi.hoisted(() => ({
	exposeInMainWorld: vi.fn<(key: string, api: DesktopApi) => void>(),
	invoke: vi.fn(),
}));

vi.mock('electron', () => ({
	contextBridge: { exposeInMainWorld: mocks.exposeInMainWorld },
	ipcRenderer: { invoke: mocks.invoke },
}));

describe('preload bridge', () => {
	it('exposes only app information through a fixed IPC channel', async () => {
		await import('../../electron/preload');

		expect(mocks.exposeInMainWorld).toHaveBeenCalledExactlyOnceWith('desktop', {
			getAppInfo: expect.any(Function),
		});

		const bridge = mocks.exposeInMainWorld.mock.calls[0]?.[1];

		if (!bridge) {
			throw new Error('Preload did not expose the desktop bridge');
		}

		const info = { name: 'Example', version: '1.0.0', electron: '44.7.0' };
		mocks.invoke.mockResolvedValue(info);

		await expect(bridge.getAppInfo()).resolves.toEqual(info);
		expect(mocks.invoke).toHaveBeenCalledExactlyOnceWith('app:get-info');
	});
});
