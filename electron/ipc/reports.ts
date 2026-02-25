import { ipcMain } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { IpcChannels } from './types';
import { InvoiceRepository } from '../../src/repositories/InvoiceRepository';
import { ProductRepository } from '../../src/repositories/ProductRepository';
import { CustomerRepository } from '../../src/repositories/CustomerRepository';
import { CategoryRepository } from '../../src/repositories/CategoryRepository';

export function setupReportHandlers() {
    const invoiceRepo = new InvoiceRepository();
    const productRepo = new ProductRepository();
    const customerRepo = new CustomerRepository();
    const categoryRepo = new CategoryRepository();

    ipcMain.handle(IpcChannels.DB_REPORTS_GET_SUMMARY, async (_, startDate: string, endDate: string) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const invoices = invoiceRepo.findByDateRange(start, end);
        const completedInvoices = invoices.filter(inv => inv.status === 'completed' || !inv.status);
        const refundedInvoices = invoices.filter(inv => inv.status === 'refunded');

        const totalSales = completedInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
        const totalInvoices = completedInvoices.length;
        const averageInvoiceValue = totalInvoices > 0 ? totalSales / totalInvoices : 0;

        const wholesaleSales = completedInvoices
            .filter(inv => inv.pricingType === 'wholesale')
            .reduce((sum, inv) => sum + inv.totalAmount, 0);

        const retailSales = completedInvoices
            .filter(inv => inv.pricingType === 'retail')
            .reduce((sum, inv) => sum + inv.totalAmount, 0);

        const refundedTotal = refundedInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
        const refundedCount = refundedInvoices.length;

        return {
            totalSales,
            totalInvoices,
            averageInvoiceValue,
            wholesaleSales,
            retailSales,
            refundedTotal,
            refundedCount,
        };
    });

    ipcMain.handle(IpcChannels.DB_REPORTS_GET_BEST_SELLING, async (_, startDate: string, endDate: string, limit: number) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const invoices = invoiceRepo.findByDateRange(start, end);
        const completedInvoices = invoices.filter(inv => inv.status === 'completed' || !inv.status);

        const productSales = new Map<string, { quantity: number; revenue: number }>();

        for (const invoice of completedInvoices) {
            const items = invoiceRepo.getInvoiceItems(invoice.id);
            for (const item of items) {
                const existing = productSales.get(item.productName) || { quantity: 0, revenue: 0 };
                productSales.set(item.productName, {
                    quantity: existing.quantity + item.quantity,
                    revenue: existing.revenue + item.totalPrice,
                });
            }
        }

        return Array.from(productSales.entries())
            .map(([productName, data]) => ({
                productName,
                quantity: data.quantity,
                revenue: data.revenue,
            }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, limit);
    });

    ipcMain.handle(IpcChannels.DB_REPORTS_GET_DAILY as unknown as string, async (_, startDate: string, endDate: string) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const result = [];
        const currentDate = new Date(start);

        while (currentDate <= end) {
            const invoices = invoiceRepo.findByDate(currentDate);
            const completedInvoices = invoices.filter(inv => inv.status === 'completed' || !inv.status);
            const sales = completedInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

            result.push({
                date: currentDate.toISOString(), // Send ISO string for client to format
                sales,
                invoices: completedInvoices.length,
            });

            currentDate.setDate(currentDate.getDate() + 1);
        }

        return result;
    });

    ipcMain.handle(IpcChannels.DB_REPORTS_GET_BY_CATEGORY as unknown as string, async (_, startDate: string, endDate: string) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const invoices = invoiceRepo.findByDateRange(start, end);
        const completedInvoices = invoices.filter(inv => inv.status === 'completed' || !inv.status);

        const categories = categoryRepo.findAll();
        const categoryMap = new Map<string, string>();
        categories.forEach(c => categoryMap.set(c.id, c.name));

        const categorySales = new Map<string, number>();
        let totalSales = 0;

        for (const invoice of completedInvoices) {
            const items = invoiceRepo.getInvoiceItems(invoice.id);
            for (const item of items) {
                const product = productRepo.findById(item.productId);
                if (product) {
                    const categoryName = product.categoryId
                        ? (categoryMap.get(product.categoryId) || 'غير مصنف')
                        : 'غير مصنف';

                    const existing = categorySales.get(categoryName) || 0;
                    categorySales.set(categoryName, existing + item.totalPrice);
                    totalSales += item.totalPrice;
                }
            }
        }

        return Array.from(categorySales.entries())
            .map(([category, sales]) => ({
                category,
                sales,
                percentage: totalSales > 0 ? (sales / totalSales) * 100 : 0,
            }))
            .sort((a, b) => b.sales - a.sales);
    });

    ipcMain.handle(IpcChannels.DB_REPORTS_ARCHIVE_SAVE, async (_, snapshot: any) => {
        try {
            const date = new Date(snapshot.date);
            const year = date.getFullYear().toString();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');

            const archiveRoot = path.join(process.cwd(), 'Archives');
            const targetDir = path.join(archiveRoot, year, month);

            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }

            const fileName = `${year}-${month}-${day}_DailySummary.json`;
            const filePath = path.join(targetDir, fileName);

            fs.writeFileSync(filePath, JSON.stringify(snapshot, null, 2), 'utf8');

            return { success: true, path: filePath };
        } catch (error: any) {
            console.error('Archive Save Error:', error);
            return { success: false, error: error.message };
        }
    });
}
