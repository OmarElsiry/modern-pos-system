import { ReportService } from './ReportService';
import { ProductService } from './ProductService';
import { DailySnapshot, Product } from '../types/models';

export class ArchiveService {
    private reportService = new ReportService();
    private productService = new ProductService();

    /**
     * Generates a snapshot of the current day and saves it to the hierarchical archive.
     */
    async archiveDailyReport(): Promise<{ success: boolean; path?: string; error?: string }> {
        try {
            const today = new Date();
            // Set to start and end of day
            const startOfDay = new Date(today.setHours(0, 0, 0, 0));
            const endOfDay = new Date(today.setHours(23, 59, 59, 999));

            // 1. Get Summary
            const summary = await this.reportService.getSalesSummary(startOfDay, endOfDay);

            // 2. Get Top Products (limit 5)
            const bestSelling = await this.reportService.getBestSellingProducts(startOfDay, endOfDay, 5);

            // 3. Get Stock Alerts
            const inventoryResponse = await this.productService.getAllProducts();
            const products: Product[] = inventoryResponse.success ? inventoryResponse.data || [] : [];
            const lowStockCount = products.filter((p: Product) => p.stockQuantity <= (p.minStockLevel || 10)).length;

            // 4. Construct Snapshot
            const snapshot: DailySnapshot = {
                date: startOfDay.toISOString().split('T')[0],
                totalSales: summary.totalSales,
                invoiceCount: summary.totalInvoices,
                topProducts: bestSelling.map(p => ({ name: p.productName, quantity: p.quantity })),
                stockAlertsCount: lowStockCount,
                cashSales: summary.retailSales, // Simplified for now
                cardSales: 0, // Placeholder
                lastUpdated: new Date()
            };

            // 5. Save to File System via IPC
            const api = (window as any).electronAPI;
            if (!api?.reports?.archiveSave) return { success: false, error: 'Electronic only feature' };
            return await api.reports.archiveSave(snapshot);
        } catch (error: any) {
            console.error('Archive Generation Error:', error);
            return { success: false, error: error.message };
        }
    }
}
