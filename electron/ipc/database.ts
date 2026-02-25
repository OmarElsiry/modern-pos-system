import { ipcMain } from 'electron';
import { IpcChannels } from './types';
import { ProductRepository } from '../../src/repositories/ProductRepository';
import { CustomerRepository } from '../../src/repositories/CustomerRepository';
import { CategoryRepository } from '../../src/repositories/CategoryRepository';
import { InvoiceRepository } from '../../src/repositories/InvoiceRepository';

export function setupIpcHandlers() {
    const productRepo = new ProductRepository();
    const customerRepo = new CustomerRepository();
    const categoryRepo = new CategoryRepository();
    const invoiceRepo = new InvoiceRepository();

    // Products
    ipcMain.handle(IpcChannels.DB_PRODUCTS_GET_ALL, async () => {
        return await productRepo.findAll();
    });

    ipcMain.handle(IpcChannels.DB_PRODUCTS_SEARCH, async (_, query: string) => {
        return await productRepo.findAll({ searchTerm: query });
    });

    ipcMain.handle(IpcChannels.DB_PRODUCTS_GET_BY_ID, async (_, id: string) => {
        return await productRepo.findById(id);
    });

    ipcMain.handle(IpcChannels.DB_PRODUCTS_CREATE, async (_, input: any) => {
        return await productRepo.create(input);
    });

    ipcMain.handle(IpcChannels.DB_PRODUCTS_UPDATE, async (_, id: string, updates: any) => {
        return await productRepo.update(id, updates);
    });

    ipcMain.handle(IpcChannels.DB_PRODUCTS_DELETE, async (_, id: string) => {
        return await productRepo.delete(id);
    });

    ipcMain.handle(IpcChannels.DB_PRODUCTS_UPDATE_STOCK, async (_, id: string, bQuantity: number) => {
        return await productRepo.updateStock(id, bQuantity);
    });

    // Categories
    ipcMain.handle(IpcChannels.DB_CATEGORIES_GET_ALL, async () => {
        return await categoryRepo.findAll();
    });

    ipcMain.handle(IpcChannels.DB_CATEGORIES_GET_BY_ID, async (_, id: string) => {
        return await categoryRepo.findById(id);
    });

    ipcMain.handle(IpcChannels.DB_CATEGORIES_CREATE, async (_, input: any) => {
        return await categoryRepo.create(input);
    });

    ipcMain.handle(IpcChannels.DB_CATEGORIES_UPDATE, async (_, id: string, updates: any) => {
        return await categoryRepo.update(id, updates);
    });

    ipcMain.handle(IpcChannels.DB_CATEGORIES_DELETE, async (_, id: string) => {
        return await categoryRepo.delete(id);
    });

    // Customers
    ipcMain.handle(IpcChannels.DB_CUSTOMERS_GET_ALL, async () => {
        return await customerRepo.findAll();
    });

    ipcMain.handle(IpcChannels.DB_CUSTOMERS_SEARCH, async (_, query: string) => {
        return await customerRepo.findAll(query);
    });

    ipcMain.handle(IpcChannels.DB_CUSTOMERS_GET_BY_ID, async (_, id: string) => {
        return await customerRepo.findById(id);
    });

    ipcMain.handle(IpcChannels.DB_CUSTOMERS_CREATE, async (_, input: any) => {
        return await customerRepo.create(input);
    });

    ipcMain.handle(IpcChannels.DB_CUSTOMERS_UPDATE, async (_, id: string, updates: any) => {
        return await customerRepo.update(id, updates);
    });

    ipcMain.handle(IpcChannels.DB_CUSTOMERS_DELETE, async (_, id: string) => {
        return await customerRepo.delete(id);
    });

    ipcMain.handle(IpcChannels.DB_CUSTOMERS_GET_HISTORY, async (_, id: string) => {
        return await customerRepo.getPurchaseHistory(id);
    });

    // Invoices
    ipcMain.handle(IpcChannels.DB_INVOICES_CREATE, async (_, invoice: any, items: any[]) => {
        const savedInvoice = await invoiceRepo.save({
            ...invoice,
            items
        });
        return savedInvoice;
    });

    ipcMain.handle(IpcChannels.DB_INVOICES_GET_ALL, async () => {
        return await invoiceRepo.findAll();
    });

    ipcMain.handle(IpcChannels.DB_INVOICES_GET_BY_ID, async (_, id: string) => {
        return await invoiceRepo.findById(id);
    });

    ipcMain.handle(IpcChannels.DB_INVOICES_REFUND, async (_, id: string, refundType: string) => {
        return await invoiceRepo.refund(id, refundType as 'defective' | 'good_condition');
    });
}
