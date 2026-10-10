const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
	throw new Error('Application root #app was not found');
}

const heading = document.createElement('h1');
heading.textContent = document.title;

const status = document.createElement('p');
status.setAttribute('role', 'status');

const button = document.createElement('button');
button.textContent = 'Get app information';
button.disabled = !window.desktop;

status.textContent = window.desktop
	? 'Desktop bridge ready'
	: 'Web preview: desktop APIs are unavailable';

button.addEventListener('click', () => {
	void showAppInfo();
});

async function showAppInfo(): Promise<void> {
	if (!window.desktop) {
		throw new Error('The desktop bridge is unavailable');
	}

	try {
		const info = await window.desktop.getAppInfo();
		const runtime = `Electron ${info.electron}`;

		status.textContent = `${info.name} v${info.version} (${runtime})`;
	}
	catch (error: unknown) {
		status.textContent = `Unable to get app information: ${String(error)}`;
	}
}

app.append(heading, status, button);

export {};
