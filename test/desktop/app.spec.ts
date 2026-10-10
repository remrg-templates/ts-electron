import { _electron as electron, test, expect } from '@playwright/test';
import { resolve } from 'node:path';

test('loads the packaged renderer with an isolated desktop bridge', async () => {
	const application = await electron.launch({
		args: [resolve('.')],
		env: { ...process.env, ELECTRON_RENDERER_URL: '' },
	});

	try {
		const window = await application.firstWindow();

		await expect(window.getByRole('status')).toHaveText('Desktop bridge ready');
		await window.getByRole('button', { name: 'Get app information' }).click();
		await expect(window.getByRole('status')).toContainText('(Electron ');

		expect(
			await window.evaluate(() => typeof Reflect.get(globalThis, 'require'))
		).toBe('undefined');
		expect(
			await window.evaluate(() => typeof Reflect.get(globalThis, 'process'))
		).toBe('undefined');
	}
	finally {
		await application.close();
	}
});
