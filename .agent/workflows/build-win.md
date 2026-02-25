---
description: How to build the JOECASHIER Windows application
---

# Windows Build Workflow

Use this workflow to generate a Windows executable or installer for the JOECASHIER POS system.

## Prerequisites
- Windows OS
- Node.js installed
- All dependencies installed (`npm install`)

## Build Steps

### 1. Standard Production Build (Installer)
This command builds the React frontend, compiles the Electron main process, and packages everything into an installer or unpacked directory as configured in `package.json`.
```bash
npm run dist
```
Result will be in the `release/` directory.

### 2. Portable/Packaged Build
This command uses `electron-packager` to create a standalone folder with a `.exe` file, intended for portable use.
```bash
npm run dist:win
```
Result will be in `release/portable/`.

### 3. Web Build (for Vercel/Web)
If you want to build the web version (without Electron/Local DB features):
```bash
npm run build:web
```
Result will be in `dist/`.

## Troubleshooting
If the build fails due to native modules (like `better-sqlite3`), run:
```bash
npm run postinstall
```
This will rebuild native dependencies for the local Electron version.
