import { resolve } from 'node:path';
import { defineConfig } from 'electron-vite';

export default defineConfig({
	main: {
		build: {
			outDir: 'dist/main',
			rollupOptions: {
				input: resolve('electron/main.ts'),
				output: { entryFileNames: 'index.js' },
			},
		},
	},
	preload: {
		build: {
			externalizeDeps: false,
			outDir: 'dist/preload',
			rollupOptions: {
				input: resolve('electron/preload.ts'),
				output: { entryFileNames: 'index.js', format: 'cjs' },
			},
		},
	},
	renderer: {
		root: '.',
		base: './',
		resolve: { alias: { '@': resolve('src') } },
		build: {
			outDir: 'dist/renderer',
			rollupOptions: { input: resolve('index.html') },
		},
	},
});
