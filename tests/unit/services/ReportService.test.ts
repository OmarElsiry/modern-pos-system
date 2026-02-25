import { ReportService } from '../../../src/services/ReportService';
import { SalesService } from '../../../src/services/SalesService';
import { ProductService } from '../../../src/services/ProductService';
import { CategoryService } from '../../../src/services/CategoryService';
import { initializeDatabase, closeDatabase } from '../../../src/database/connection';
import * as path from 'path';
import * as fs from 'fs';

describe('ReportService', () => {
  let reportService: ReportService;
  let salesService: SalesService;
  let productService: ProductService;
  let categoryService: CategoryService;
  const testDbPath = path.join(__dirname, '../../test-report-service.db');
  let categoryId: string;
  let productBarcode: string;

  beforeEach(async () => {
    // Clean up any existing test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }

    // Initialize database
    initializeDatabase(testDbPath);
    reportService = new ReportService();
    salesService = new SalesService();
    productService = new ProductService();
    categoryService = new CategoryService();

    // Create a test category
    const categoryResult = await categoryService.createCategory({
      name: 'Test Category',
    });
    if (categoryResult.success) {
      categoryId = categoryResult.data.id;
    }

    // Create a test product
    productBarcode = '1234567890';
    await productService.createProduct({
      name: 'Test Product',
      barcode: productBarcode,
      categoryId,
      wholesalePrice: 10,
      retailPrice: 15,
      stockQuantity: 100,
    });
  });

  afterEach(() => {
    closeDatabase();
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe('getDailySalesReport', () => {
    it('should return daily sales report', async () => {
      // Create a sale
      await salesService.addProductToInvoice(productBarcode);
      await salesService.completeInvoice();

      const result = await reportService.getDailySalesReport(new Date());

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.totalInvoices).toBe(1);
        expect(result.data.totalSales).toBeGreaterThan(0);
      }
    });

    it('should return zero for day with no sales', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const result = await reportService.getDailySalesReport(yesterday);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.totalInvoices).toBe(0);
        expect(result.data.totalSales).toBe(0);
      }
    });
  });

  describe('getPeriodSalesReport', () => {
    it('should return period sales report', async () => {
      // Create a sale
      await salesService.addProductToInvoice(productBarcode);
      await salesService.completeInvoice();

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 1);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 1);

      const result = await reportService.getPeriodSalesReport(startDate, endDate);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.totalInvoices).toBe(1);
        expect(result.data.totalSales).toBeGreaterThan(0);
      }
    });
  });

  describe('getTopSellingProducts', () => {
    it('should return top selling products', async () => {
      // Create a sale
      await salesService.addProductToInvoice(productBarcode);
      await salesService.completeInvoice();

      const result = await reportService.getTopSellingProducts(10);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.length).toBe(1);
        expect(result.data[0].productName).toBe('Test Product');
        expect(result.data[0].totalQuantitySold).toBe(1);
      }
    });

    it('should return empty array when no sales', async () => {
      const result = await reportService.getTopSellingProducts(10);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.length).toBe(0);
      }
    });
  });

  describe('getInventoryReport', () => {
    it('should return inventory report', async () => {
      const result = await reportService.getInventoryReport();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.totalProducts).toBe(1);
        expect(result.data.products[0].name).toBe('Test Product');
        expect(result.data.products[0].stockQuantity).toBe(100);
      }
    });

    it('should calculate inventory values correctly', async () => {
      const result = await reportService.getInventoryReport();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.totalWholesaleValue).toBe(1000); // 100 * 10
        expect(result.data.totalRetailValue).toBe(1500); // 100 * 15
      }
    });
  });
});
