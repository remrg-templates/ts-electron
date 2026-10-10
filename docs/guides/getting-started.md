# Getting Started

{{ remrg:task Create a getting-started guide. }}

## Prerequisites

- Node.js 22.12 or later.
- npm 10.8.2 or later.
- Git.

## Install Dependencies

From the repository root, install the dependencies recorded in the lockfile:

```bash
npm ci
```

Install the browsers used by the end-to-end tests:

```bash
npx playwright install
```

On a supported Linux environment that needs browser system dependencies, use `npx playwright install --with-deps` instead. Installing system dependencies may require administrator privileges.

## Build and Preview

```bash
npm run build
npm start
```

For a standalone browser build and preview instead:

```bash
npm run build:web
npm run preview
```

## Run the Desktop Application

Run the build/start from the previous section before running dev:

```bash
npm run dev
```

## Run the Web Preview

```bash
npm run dev:web
```

Open the URL printed by Vite, normally <http://localhost:8080>. If that port is already in use, the development server selects another available port. Desktop APIs are unavailable in a regular browser, so the example button is disabled there.

## Package and Release

In a consumer project, choose a unique reverse-domain `appId` in [electron-builder.yml](../../electron-builder.yml), such as `com.yourcompany.yourapp`. Set the application version and description in [package.json](../../package.json) before a release. remrg fills the project name, organization, and license placeholders when creating the consumer project; electron-builder cannot package the unexpanded template package name.

Build an unpacked application for local verification:

```bash
npm run package
```

Build an installer for the current host platform:

```bash
npm run dist
```

Outputs are written to `release/`. The default targets are AppImage on Linux, NSIS on Windows, and DMG on macOS.

## Validate Changes

Check TypeScript types and formatting/lint rules without modifying files:

```bash
npm run typecheck
npm run lint:check
```

Run unit tests with coverage:

```bash
npx vitest run --coverage
```

Run browser end-to-end tests:

```bash
npm run test:e2e
```

Playwright starts the Vite development server on port 8080. Keep that port free, or ensure any existing server there is this application's development server: outside CI, Playwright reuses an existing server.

Run the Electron smoke test:

```bash
npm run test:desktop
```

This builds and launches Electron with the production renderer, checks the preload bridge, and verifies that Node globals are not exposed to the renderer. On headless Linux:

```bash
xvfb-run --auto-servernum npm run test:desktop
```

For all configured checks and tests:

```bash
npm run test:ci
```

Interactive test commands are also available:

```bash
npm run test:dev
npm run test:dev:e2e
```

Use `npm run lint` to apply formatting and automatic lint fixes. Unlike `npm run test:ci`, `npm test` runs this modifying lint command before checking types and running tests.

## Extend the Desktop Bridge

Keep operating-system access in the main process. Add explicit methods to [electron/bridge.ts](../../electron/bridge.ts), expose only those methods from the preload script, and validate the sender and any arguments in IPC handlers. Do not expose `ipcRenderer`, arbitrary channel names, or filesystem primitives directly to the renderer.

The starter enables context isolation and renderer sandboxing, denies permissions and new windows, blocks renderer-initiated navigation, and applies a content security policy in [index.html](../../index.html). Change these policies only for specific application requirements and add tests for the permitted behavior.

The included [CI workflow](../../.github/workflows/ci.yml) runs web and Electron tests on Linux, Windows, and macOS. It does not publish installers or configure signing credentials.
