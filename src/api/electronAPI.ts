import { ipcRenderer } from 'electron';
import { IpcChannels } from '../../electron/ipc/types';

export const electronAPI = {
    products: {
        getAll: () => ipcRenderer.invoke(IpcChannels.DB_PRODUCTS_GET_ALL),
        search: (query: string) => ipcRenderer.invoke(IpcChannels.DB_PRODUCTS_SEARCH, query),
        getById: (id: string) => ipcRenderer.invoke(IpcChannels.DB_PRODUCTS_GET_BY_ID, id),
        create: (input: any) => ipcRenderer.invoke(IpcChannels.DB_PRODUCTS_CREATE, input),
        update: (id: string, updates: any) => ipcRenderer.invoke(IpcChannels.DB_PRODUCTS_UPDATE, id, updates),
        delete: (id: string) => ipcRenderer.invoke(IpcChannels.DB_PRODUCTS_DELETE, id),
        updateStock: (id: string, quantity: number) => ipcRenderer.invoke(IpcChannels.DB_PRODUCTS_UPDATE_STOCK, id, quantity),
    },
    categories: {
        getAll: () => ipcRenderer.invoke(IpcChannels.DB_CATEGORIES_GET_ALL),
        getById: (id: string) => ipcRenderer.invoke(IpcChannels.DB_CATEGORIES_GET_BY_ID, id),
        create: (input: any) => ipcRenderer.invoke(IpcChannels.DB_CATEGORIES_CREATE, input),
        update: (id: string, updates: any) => ipcRenderer.invoke(IpcChannels.DB_CATEGORIES_UPDATE, id, updates),
        delete: (id: string) => ipcRenderer.invoke(IpcChannels.DB_CATEGORIES_DELETE, id),
    },
    customers: {
        getAll: () => ipcRenderer.invoke(IpcChannels.DB_CUSTOMERS_GET_ALL),
        search: (query: string) => ipcRenderer.invoke(IpcChannels.DB_CUSTOMERS_SEARCH, query),
        getById: (id: string) => ipcRenderer.invoke(IpcChannels.DB_CUSTOMERS_GET_BY_ID, id),
        create: (input: any) => ipcRenderer.invoke(IpcChannels.DB_CUSTOMERS_CREATE, input),
        update: (id: string, updates: any) => ipcRenderer.invoke(IpcChannels.DB_CUSTOMERS_UPDATE, id, updates),
        delete: (id: string) => ipcRenderer.invoke(IpcChannels.DB_CUSTOMERS_DELETE, id),
        getHistory: (id: string) => ipcRenderer.invoke(IpcChannels.DB_CUSTOMERS_GET_HISTORY, id),
    },
    invoices: {
        create: (invoice: any, items: any[]) => ipcRenderer.invoke(IpcChannels.DB_INVOICES_CREATE, invoice, items),
        getAll: () => ipcRenderer.invoke(IpcChannels.DB_INVOICES_GET_ALL),
        getById: (id: string) => ipcRenderer.invoke(IpcChannels.DB_INVOICES_GET_BY_ID, id),
    },
    reports: {
        getSummary: (startDate: string, endDate: string) => ipcRenderer.invoke(IpcChannels.DB_REPORTS_GET_SUMMARY as string, startDate, endDate),
        getBestSelling: (startDate: string, endDate: string, limit: number) => ipcRenderer.invoke(IpcChannels.DB_REPORTS_GET_BEST_SELLING as string, startDate, endDate, limit),
        getDaily: (startDate: string, endDate: string) => ipcRenderer.invoke(IpcChannels.DB_REPORTS_GET_DAILY as string, startDate, endDate),
        getByCategory: (startDate: string, endDate: string) => ipcRenderer.invoke(IpcChannels.DB_REPORTS_GET_BY_CATEGORY as string, startDate, endDate),
    },
    backup: {
        create: () => ipcRenderer.invoke(IpcChannels.DB_BACKUP_CREATE),
        restore: (backupPath: string) => ipcRenderer.invoke(IpcChannels.DB_BACKUP_RESTORE, backupPath),
        list: () => ipcRenderer.invoke(IpcChannels.DB_BACKUP_LIST),
    },
    app: {
        getVersion: () => ipcRenderer.invoke(IpcChannels.APP_GET_VERSION),
    }
};
