# Electron Build Fix Guide

## Problem Summary

The POS system has architectural issues that prevent it from working properly in both browser and Electron environments:

1. **Browser**: Cannot load because `better-sqlite3` is a Node.js native module
2. **Electron (Built)**: `promisify is not a function` error due to Vite bundling issues
3. **Electron (Dev)**: Works but has security warnings

## Root Cause

The application uses `nodeIntegration: true` and `contextIsolation: false` in Electron, which is:
- ❌ A security risk
- ❌ Not compatible with modern Vite bundling
- ❌ Prevents browser-based development/testing

## Recommended Solution: Electron IPC Bridge

The proper way to build an Electron app is to:
1. Keep the renderer process (React) isolated from Node.js
2. Use IPC (Inter-Process Communication) to access database from main process
3. This allows the React app to work in browsers (with mock data) and Electron (with real database)

### Implementation Steps

#### Step 1: Create Database API in Main Process

Create `electron/database-api.ts`:

```typescript
import { ipcMain } from 'electron';
import { ProductRepository } from '../src/repositories/ProductRepository';
import { CategoryRepository } from '../src/repositories/CategoryRepository';
import { InvoiceRepository } from '../src/repositories/InvoiceRepository';

export function setupDatabaseAPI() {
  const productRepo = new ProductRepository();
  const categoryRepo = new CategoryRepository();
  const invoiceRepo = new InvoiceRepository();

  // Product operations
  ipcMain.handle('db:products:findByBarcode', async (_, barcode: string) => {
    return productRepo.findByBarcode(barcode);
  });

  ipcMain.handle('db:products:findById', async (_, id: string) => {
    return productRepo.findById(id);
  });

  ipcMain.handle('db:products:findAll', async (_, filters) => {
    return productRepo.findAll(filters);
  });

  ipcMain.handle('db:products:create', async (_, input) => {
    return productRepo.create(input);
  });

  ipcMain.handle('db:products:update', async (_, id, updates) => {
    return productRepo.update(id, updates);
  });

  ipcMain.handle('db:products:delete', async (_, id) => {
    return productRepo.delete(id);
  });

  ipcMain.handle('db:products:updateStock', async (_, id, quantity) => {
    return productRepo.updateStock(id, quantity);
  });

  // Category operations
  ipcMain.handle('db:categories:findAll', async () => {
    return categoryRepo.findAll();
  });

  ipcMain.handle('db:categories:findById', async (_, id) => {
    return categoryRepo.findById(id);
  });

  ipcMain.handle('db:categories:create', async (_, input) => {
    return categoryRepo.create(input);
  });

  ipcMain.handle('db:categories:update', async (_, id, updates) => {
    return categoryRepo.update(id, updates);
  });

  ipcMain.handle('db:categories:delete', async (_, id) => {
    return categoryRepo.delete(id);
  });

  // Invoice operations
  ipcMain.handle('db:invoices:save', async (_, input) => {
    return invoiceRepo.save(input);
  });

  ipcMain.handle('db:invoices:findById', async (_, id) => {
    return invoiceRepo.findById(id);
  });

  ipcMain.handle('db:invoices:findByNumber', async (_, number) => {
    return invoiceRepo.findByInvoiceNumber(number);
  });

  ipcMain.handle('db:invoices:findAll', async (_, filters) => {
    return invoiceRepo.findAll(filters);
  });

  ipcMain.handle('db:invoices:generateNumber', async () => {
    return invoiceRepo.generateInvoiceNumber();
  });
}
```

#### Step 2: Update Main Process

Update `electron/main.ts`:

```typescript
import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { setupDatabaseAPI } from './database-api';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false, // ✅ Secure
      contextIsolation: true, // ✅ Secure
      sandbox: true, // ✅ Secure
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Load the React app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../react/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  setupDatabaseAPI(); // ✅ Setup IPC handlers
  createWindow();
});

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
```

#### Step 3: Update Preload Script

Update `electron/preload.ts`:

```typescript
import { contextBridge, ipcRenderer } from 'electron';

// Expose database API to renderer process
contextBridge.exposeInMainWorld('database', {
  products: {
    findByBarcode: (barcode: string) => ipcRenderer.invoke('db:products:findByBarcode', barcode),
    findById: (id: string) => ipcRenderer.invoke('db:products:findById', id),
    findAll: (filters?: any) => ipcRenderer.invoke('db:products:findAll', filters),
    create: (input: any) => ipcRenderer.invoke('db:products:create', input),
    update: (id: string, updates: any) => ipcRenderer.invoke('db:products:update', id, updates),
    delete: (id: string) => ipcRenderer.invoke('db:products:delete', id),
    updateStock: (id: string, quantity: number) => ipcRenderer.invoke('db:products:updateStock', id, quantity),
  },
  categories: {
    findAll: () => ipcRenderer.invoke('db:categories:findAll'),
    findById: (id: string) => ipcRenderer.invoke('db:categories:findById', id),
    create: (input: any) => ipcRenderer.invoke('db:categories:create', input),
    update: (id: string, updates: any) => ipcRenderer.invoke('db:categories:update', id, updates),
    delete: (id: string) => ipcRenderer.invoke('db:categories:delete', id),
  },
  invoices: {
    save: (input: any) => ipcRenderer.invoke('db:invoices:save', input),
    findById: (id: string) => ipcRenderer.invoke('db:invoices:findById', id),
    findByNumber: (number: string) => ipcRenderer.invoke('db:invoices:findByNumber', number),
    findAll: (filters?: any) => ipcRenderer.invoke('db:invoices:findAll', filters),
    generateNumber: () => ipcRenderer.invoke('db:invoices:generateNumber'),
  },
});

// TypeScript declaration
declare global {
  interface Window {
    database: {
      products: {
        findByBarcode: (barcode: string) => Promise<any>;
        findById: (id: string) => Promise<any>;
        findAll: (filters?: any) => Promise<any[]>;
        create: (input: any) => Promise<any>;
        update: (id: string, updates: any) => Promise<any>;
        delete: (id: string) => Promise<void>;
        updateStock: (id: string, quantity: number) => Promise<void>;
      };
      categories: {
        findAll: () => Promise<any[]>;
        findById: (id: string) => Promise<any>;
        create: (input: any) => Promise<any>;
        update: (id: string, updates: any) => Promise<any>;
        delete: (id: string) => Promise<void>;
      };
      invoices: {
        save: (input: any) => Promise<any>;
        findById: (id: string) => Promise<any>;
        findByNumber: (number: string) => Promise<any>;
        findAll: (filters?: any) => Promise<any[]>;
        generateNumber: () => Promise<string>;
      };
    };
  }
}
```

#### Step 4: Create Browser-Compatible Repositories

Create `src/repositories/BrowserProductRepository.ts`:

```typescript
import { Product, ProductInput, ProductFilters } from '../types/models';

/**
 * Browser-compatible Product Repository
 * Uses window.database API (Electron) or mock data (browser)
 */
export class BrowserProductRepository {
  private isElectron = typeof window !== 'undefined' && 'database' in window;

  async findByBarcode(barcode: string): Promise<Product | null> {
    if (this.isElectron) {
      return window.database.products.findByBarcode(barcode);
    }
    // Mock data for browser
    return null;
  }

  async findById(id: string): Promise<Product | null> {
    if (this.isElectron) {
      return window.database.products.findById(id);
    }
    return null;
  }

  async findAll(filters?: ProductFilters): Promise<Product[]> {
    if (this.isElectron) {
      return window.database.products.findAll(filters);
    }
    return [];
  }

  async create(input: ProductInput): Promise<Product> {
    if (this.isElectron) {
      return window.database.products.create(input);
    }
    throw new Error('Not available in browser mode');
  }

  async update(id: string, updates: Partial<ProductInput>): Promise<Product> {
    if (this.isElectron) {
      return window.database.products.update(id, updates);
    }
    throw new Error('Not available in browser mode');
  }

  async delete(id: string): Promise<void> {
    if (this.isElectron) {
      return window.database.products.delete(id);
    }
    throw new Error('Not available in browser mode');
  }

  async updateStock(productId: string, quantity: number): Promise<void> {
    if (this.isElectron) {
      return window.database.products.updateStock(productId, quantity);
    }
    throw new Error('Not available in browser mode');
  }
}
```

#### Step 5: Update Services

Update `src/services/SalesService.ts` to use the browser-compatible repository:

```typescript
import { BrowserProductRepository } from '../repositories/BrowserProductRepository';
// ... rest of imports

export class SalesService {
  private productRepository: BrowserProductRepository;
  // ... rest of code

  constructor() {
    this.productRepository = new BrowserProductRepository();
    // ... rest of constructor
  }
}
```

## Benefits of This Approach

✅ **Security**: Proper Electron security model
✅ **Browser Development**: React app works in browser with mock data
✅ **Testing**: Can test UI without database
✅ **Separation**: Clear separation between UI and data layers
✅ **Performance**: Database operations in main process (better performance)
✅ **Debugging**: Easier to debug renderer and main processes separately

## Alternative: Quick Fix for Current Setup

If you want to keep the current architecture temporarily:

1. Use development mode only: `npm run dev` (don't build)
2. Accept the security warnings
3. Focus on functionality first
4. Refactor to IPC bridge later

## Current Status

- ✅ Browser: Loads but can't access database (expected)
- ⚠️ Electron Dev: Works but has security warnings
- ❌ Electron Built: Has bundling issues with Node.js modules

## Recommendation

Implement the IPC bridge solution for a production-ready, secure, and testable application.
