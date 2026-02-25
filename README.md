# 🛍️ Modern POS System

**Live Demo:** [https://modern-pos-system-pink.vercel.app/](https://modern-pos-system-pink.vercel.app/)

A blazing-fast, modern, desktop-first Point of Sale (POS) system tailored for small-to-medium retailers. Built with cutting-edge web technologies wrapped seamlessly in an Electron application, this POS offers a fast, reliable, and rich user experience while connecting locally to a high-speed SQLite database.

## 🚀 Key Features

- **Modern & Intuitive Dashboard:** Real-time data visualization built with React and Tailwind CSS.
- **Offline First & Native Speed:** Runs fully locally on an embedded SQLite (`better-sqlite3`) database preventing internet disruption failures.
- **Cross-Platform Compatibility:** Packaged as an Electron app for Windows, macOS, and Linux without sacrificing any native feel.
- **Product & Inventory Management:** Add, edit, remove products quickly. Keep track of stock and low-inventory warnings.
- **Barcode Support:** High-efficiency barcode scanning out of the box integrating with any standard USB/Bluetooth scanner.
- **Invoices & Receipts Generation:** Ability to generate, export to PDF, print, and save daily sales.

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, Lucide React, Radix UI.
- **Backend / Desktop Frame:** Electron, Vite, Node.js.
- **Database:** `better-sqlite3` native bindings for ultimate persistence performance.
- **Testing:** Playwright for E2E and Jest for Unit.

---

## 🏃 Getting Started (Development)

To get started locally with the development environment, make sure you have [Node.js](https://nodejs.org) (v18+ recommended) installed.

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
This command will concurrently spin up the Vite React server and the Electron desktop instance.
```bash
npm run dev
```

---

## 📦 Building for Production

### Desktop Application
To build and package the application into standalone executables for Windows:

**Portable Version**:
Creates a single `.exe` file that runs without installation.
```bash
npm run dist:portable
```

**Installer Version (NSIS)**:
Creates a setup file that installs the application onto the user's system.
```bash
npm run dist:installer
```

*Other platforms:*
```bash
npm run dist:mac
npm run dist:linux
```
The built executables and setup files will be located inside the `release/` directory.

### 🎨 Customizing the Application Icon
To change the application icon (which affects the installer file, the application taskbar icon, and the desktop shortcut):

1.  **Prepare your icon:** Create an `.ico` file (for Windows) or a `.png` file. High resolution (256x256 or 512x512) is recommended.
2.  **Replace the file:** Overwrite the existing icon in the `build/` directory:
    - Path: `build/icon.ico`
3.  **Rebuild:** Run the distribution command again (e.g., `npm run dist:installer`) to apply the new icon to the executable.

*Note: The icon defined in the `build/` folder is automatically used by `electron-builder` for both the installer file and the application itself once launched.*

### Web Application
If you want to build the static React bundle separately:
```bash
npm run build:web
```

---

## 📄 License & Contribution
Copyright © All Rights Reserved. Not explicitly licensed for open distribution without explicit permission.
