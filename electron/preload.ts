import { contextBridge, ipcRenderer } from 'electron';

// Hardcoded channel strings to avoid imports in sandboxed preload
const CHANNELS = {
  DB_PRODUCTS_GET_ALL: 'db:products:getAll',
  DB_PRODUCTS_SEARCH: 'db:products:search',
  DB_PRODUCTS_GET_BY_ID: 'db:products:getById',
  DB_PRODUCTS_CREATE: 'db:products:create',
  DB_PRODUCTS_UPDATE: 'db:products:update',
  DB_PRODUCTS_DELETE: 'db:products:delete',
  DB_PRODUCTS_UPDATE_STOCK: 'db:products:updateStock',

  DB_CATEGORIES_GET_ALL: 'db:categories:getAll',
  DB_CATEGORIES_GET_BY_ID: 'db:categories:getById',
  DB_CATEGORIES_CREATE: 'db:categories:create',
  DB_CATEGORIES_UPDATE: 'db:categories:update',
  DB_CATEGORIES_DELETE: 'db:categories:delete',

  DB_CUSTOMERS_GET_ALL: 'db:customers:getAll',
  DB_CUSTOMERS_SEARCH: 'db:customers:search',
  DB_CUSTOMERS_GET_BY_ID: 'db:customers:getById',
  DB_CUSTOMERS_CREATE: 'db:customers:create',
  DB_CUSTOMERS_UPDATE: 'db:customers:update',
  DB_CUSTOMERS_DELETE: 'db:customers:delete',
  DB_CUSTOMERS_GET_HISTORY: 'db:customers:getHistory',

  DB_INVOICES_CREATE: 'db:invoices:create',
  DB_INVOICES_GET_ALL: 'db:invoices:getAll',
  DB_INVOICES_GET_BY_ID: 'db:invoices:getById',
  DB_INVOICES_REFUND: 'db:invoices:refund',

  DB_REPORTS_GET_SUMMARY: 'db:reports:getSalesSummary',
  DB_REPORTS_GET_BEST_SELLING: 'db:reports:getBestSellingProducts',
  DB_REPORTS_GET_DAILY: 'db:reports:getDaily',
  DB_REPORTS_GET_BY_CATEGORY: 'db:reports:getByCategory',

  DB_BACKUP_CREATE: 'db:backup:create',
  DB_BACKUP_RESTORE: 'db:backup:restore',
  DB_BACKUP_LIST: 'db:backup:list',

  APP_GET_VERSION: 'app:getVersion',
  APP_TOGGLE_KIOSK: 'app:toggleKiosk',
  APP_PRINT: 'app:print',
  APP_SAVE_AS_PDF: 'app:saveAsPDF',
  DB_REPORTS_ARCHIVE_SAVE: 'db:reports:archiveSave',
  DB_SETTINGS_GET: 'db:settings:get',
  DB_SETTINGS_UPDATE: 'db:settings:update',
};

contextBridge.exposeInMainWorld('electronAPI', {
  products: {
    getAll: () => ipcRenderer.invoke(CHANNELS.DB_PRODUCTS_GET_ALL),
    search: (query: string) => ipcRenderer.invoke(CHANNELS.DB_PRODUCTS_SEARCH, query),
    getById: (id: string) => ipcRenderer.invoke(CHANNELS.DB_PRODUCTS_GET_BY_ID, id),
    create: (input: any) => ipcRenderer.invoke(CHANNELS.DB_PRODUCTS_CREATE, input),
    update: (id: string, updates: any) => ipcRenderer.invoke(CHANNELS.DB_PRODUCTS_UPDATE, id, updates),
    delete: (id: string) => ipcRenderer.invoke(CHANNELS.DB_PRODUCTS_DELETE, id),
    updateStock: (id: string, quantity: number) => ipcRenderer.invoke(CHANNELS.DB_PRODUCTS_UPDATE_STOCK, id, quantity),
  },
  categories: {
    getAll: () => ipcRenderer.invoke(CHANNELS.DB_CATEGORIES_GET_ALL),
    getById: (id: string) => ipcRenderer.invoke(CHANNELS.DB_CATEGORIES_GET_BY_ID, id),
    create: (input: any) => ipcRenderer.invoke(CHANNELS.DB_CATEGORIES_CREATE, input),
    update: (id: string, updates: any) => ipcRenderer.invoke(CHANNELS.DB_CATEGORIES_UPDATE, id, updates),
    delete: (id: string) => ipcRenderer.invoke(CHANNELS.DB_CATEGORIES_DELETE, id),
  },
  customers: {
    getAll: () => ipcRenderer.invoke(CHANNELS.DB_CUSTOMERS_GET_ALL),
    search: (query: string) => ipcRenderer.invoke(CHANNELS.DB_CUSTOMERS_SEARCH, query),
    getById: (id: string) => ipcRenderer.invoke(CHANNELS.DB_CUSTOMERS_GET_BY_ID, id),
    create: (input: any) => ipcRenderer.invoke(CHANNELS.DB_CUSTOMERS_CREATE, input),
    update: (id: string, updates: any) => ipcRenderer.invoke(CHANNELS.DB_CUSTOMERS_UPDATE, id, updates),
    delete: (id: string) => ipcRenderer.invoke(CHANNELS.DB_CUSTOMERS_DELETE, id),
    getHistory: (id: string) => ipcRenderer.invoke(CHANNELS.DB_CUSTOMERS_GET_HISTORY, id),
  },
  invoices: {
    create: (invoice: any, items: any[]) => ipcRenderer.invoke(CHANNELS.DB_INVOICES_CREATE, invoice, items),
    getAll: () => ipcRenderer.invoke(CHANNELS.DB_INVOICES_GET_ALL),
    getById: (id: string) => ipcRenderer.invoke(CHANNELS.DB_INVOICES_GET_BY_ID, id),
    refund: (id: string, refundType: string) => ipcRenderer.invoke(CHANNELS.DB_INVOICES_REFUND, id, refundType),
  },
  reports: {
    getSummary: (startDate: string, endDate: string) => ipcRenderer.invoke(CHANNELS.DB_REPORTS_GET_SUMMARY, startDate, endDate),
    getBestSelling: (startDate: string, endDate: string, limit: number) => ipcRenderer.invoke(CHANNELS.DB_REPORTS_GET_BEST_SELLING, startDate, endDate, limit),
    getDaily: (startDate: string, endDate: string) => ipcRenderer.invoke(CHANNELS.DB_REPORTS_GET_DAILY, startDate, endDate),
    getByCategory: (startDate: string, endDate: string) => ipcRenderer.invoke(CHANNELS.DB_REPORTS_GET_BY_CATEGORY, startDate, endDate),
    archiveSave: (snapshot: any) => ipcRenderer.invoke(CHANNELS.DB_REPORTS_ARCHIVE_SAVE, snapshot),
  },
  backup: {
    create: () => ipcRenderer.invoke(CHANNELS.DB_BACKUP_CREATE),
    restore: (backupPath: string) => ipcRenderer.invoke(CHANNELS.DB_BACKUP_RESTORE, backupPath),
    list: () => ipcRenderer.invoke(CHANNELS.DB_BACKUP_LIST),
  },
  app: {
    getVersion: () => ipcRenderer.invoke(CHANNELS.APP_GET_VERSION),
    toggleKiosk: (enabled: boolean) => ipcRenderer.invoke(CHANNELS.APP_TOGGLE_KIOSK, enabled),
    print: (options: any) => ipcRenderer.invoke(CHANNELS.APP_PRINT, options),
    saveAsPDF: (options: any) => ipcRenderer.invoke(CHANNELS.APP_SAVE_AS_PDF, options),
  },
  settings: {
    get: () => ipcRenderer.invoke(CHANNELS.DB_SETTINGS_GET),
    update: (settings: any) => ipcRenderer.invoke(CHANNELS.DB_SETTINGS_UPDATE, settings),
  }
});
