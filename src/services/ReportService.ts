export interface SalesReport {
  totalSales: number;
  totalInvoices: number;
  averageInvoiceValue: number;
  wholesaleSales: number;
  retailSales: number;
  refundedTotal: number;
  refundedCount: number;
}

export interface ProductSalesData {
  productName: string;
  quantity: number;
  revenue: number;
}

export interface DailySalesData {
  date: string;
  sales: number;
  invoices: number;
}

export interface CategorySalesData {
  category: string;
  sales: number;
  percentage: number;
}

/**
 * ReportService - Refactored to use window.electronAPI (IPC)
 * Aggregation now happens in the Main process for security and performance.
 */
export class ReportService {
  /**
   * Get sales summary for a date range
   */
  async getSalesSummary(startDate: Date, endDate: Date): Promise<SalesReport> {
    return await window.electronAPI.reports.getSummary(
      startDate.toISOString(),
      endDate.toISOString()
    );
  }

  /**
   * Get best-selling products
   */
  async getBestSellingProducts(startDate: Date, endDate: Date, limit: number = 10): Promise<ProductSalesData[]> {
    return await window.electronAPI.reports.getBestSelling(
      startDate.toISOString(),
      endDate.toISOString(),
      limit
    );
  }

  /**
   * Get daily sales data for chart
   */
  async getDailySales(startDate: Date, endDate: Date): Promise<DailySalesData[]> {
    return await window.electronAPI.reports.getDaily(
      startDate.toISOString(),
      endDate.toISOString()
    );
  }

  /**
   * Get sales by category
   */
  async getSalesByCategory(startDate: Date, endDate: Date): Promise<CategorySalesData[]> {
    return await window.electronAPI.reports.getByCategory(
      startDate.toISOString(),
      endDate.toISOString()
    );
  }

  /**
   * Get top customers by purchases
   */
  async getTopCustomers(_startDate: Date, _endDate: Date, _limit: number = 10): Promise<any[]> {
    // For now, let's keep it minimal or add an IPC for it if needed
    // In a real scenario, we'd add another IPC handler
    return [];
  }
}
