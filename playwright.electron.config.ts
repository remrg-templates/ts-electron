import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: './test/desktop',
	workers: 1,
	forbidOnly: !!process.env['CI'],
	reporter: 'list',
});
