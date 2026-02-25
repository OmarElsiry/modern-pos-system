import { app, BrowserWindow, session, ipcMain, dialog } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

// --- Database Initialization First ---
// We use require to ensure this happens before repositories are loaded
const { initializeDatabase } = require('../src/database/connection');
initializeDatabase();

// --- Then Setup Handlers ---
// These will transitionaly load repositories which now have an active DB connection
const { setupIpcHandlers } = require('./ipc/database');
const { setupReportHandlers } = require('./ipc/reports');
const { setupBackupHandlers } = require('./ipc/backup');
const { setupSettingsHandlers } = require('./ipc/settings');

let mainWindow: BrowserWindow | null = null;

// Initialize handlers
// Initialize handlers
setupIpcHandlers();
setupReportHandlers();
setupBackupHandlers();
setupSettingsHandlers();

const APP_TOGGLE_KIOSK = 'app:toggleKiosk';

ipcMain.handle(APP_TOGGLE_KIOSK, async (event, enabled: boolean) => {
  if (mainWindow) {
    mainWindow.setKiosk(enabled);
    return true;
  }
  return false;
});

const APP_PRINT = 'app:print';

ipcMain.handle(APP_PRINT, async (event, options: Electron.WebContentsPrintOptions) => {
  // Use the sender (webContents) that initiated the request
  return new Promise((resolve, reject) => {
    event.sender.print(options || { silent: false, printBackground: true }, (success, failureReason) => {
      if (!success) console.error('Print failed:', failureReason);
      resolve(success);
    });
  });
});

const APP_SAVE_AS_PDF = 'app:saveAsPDF';

ipcMain.handle(APP_SAVE_AS_PDF, async (event, options: { filename: string, landscape?: boolean, html?: string }) => {
  try {
    const { filePath } = await dialog.showSaveDialog({
      title: 'حفظ كـ PDF',
      defaultPath: options.filename || 'document.pdf',
      filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
    });

    if (!filePath) return { success: false, cancelled: true };

    let pdfData: Buffer;

    if (options.html) {
      // Create a hidden window to render the HTML
      const printWin = new BrowserWindow({
        show: false,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true
        }
      });

      await printWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(options.html)}`);

      pdfData = await printWin.webContents.printToPDF({
        printBackground: true,
        margins: { marginType: 'default' },
        landscape: options.landscape || false,
        pageSize: 'A4'
      });

      printWin.destroy();
    } else {
      // Fallback to the sender's content if no HTML provided
      pdfData = await event.sender.printToPDF({
        printBackground: true,
        margins: { marginType: 'default' },
        landscape: options.landscape || false,
        pageSize: 'A4'
      });
    }

    fs.writeFileSync(filePath, pdfData);
    return { success: true };
  } catch (err) {
    console.error('PDF generation failed:', err);
    return { success: false, error: (err as Error).message };
  }
});

function createWindow() {
  // Disable CSP in development mode to allow Vite HMR
  if (process.env.NODE_ENV === 'development') {
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': ["default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; script-src * 'unsafe-inline' 'unsafe-eval' data: blob:; connect-src * 'unsafe-inline' data: blob:; img-src * data: blob: 'unsafe-inline'; frame-src * data: blob:; child-src * data: blob:; style-src * 'unsafe-inline' data: blob:;"]
        }
      });
    });
  } else {
    // Set Content Security Policy for production
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [
            "default-src 'self' 'unsafe-inline' data: blob:",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:",
            "style-src 'self' 'unsafe-inline' data: blob:",
            "img-src 'self' data: blob: android-webview-video-poster:",
            "font-src 'self' data: blob:",
            "connect-src 'self' * data: blob:",
            "frame-src 'self' data: blob:",
            "child-src 'self' data: blob:",
            "object-src 'none'"
          ].join('; ')
        }
      });
    });
  }

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    icon: path.join(__dirname, '../../build/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      experimentalFeatures: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Always load from built files (not Vite dev server)
  mainWindow.loadFile(path.join(__dirname, '../../react/index.html'));

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  // Create myWindow, load the rest of the app, etc...
  app.whenReady().then(createWindow);

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow();
    }
  });
}
