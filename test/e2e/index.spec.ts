import { test, expect } from '@playwright/test';

test('homepage has expected title', async ({ page }) => {
	await page.goto('/');

	// Adjust this according to your actual index.html title
	await expect(page).toHaveTitle(/.*{{ remrg:var project-name }}.*/);
	await expect(page.getByRole('status')).toHaveText(
		'Web preview: desktop APIs are unavailable'
	);
	await expect(page.getByRole('button')).toBeDisabled();
});
