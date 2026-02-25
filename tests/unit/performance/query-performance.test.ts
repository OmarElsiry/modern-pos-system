import { ProductRepository } from '../../../src/repositories/ProductRepository';
import { CategoryRepository } from '../../../src/repositories/CategoryRepository';
import { InvoiceRepository } from '../../../src/repositories/InvoiceRepository';
import { initializeDatabase, closeDatabase } from '../../../src/database/connection';
import * as fs from 'fs';
import * as path from 'path';

describe('Query Performance', () => {
  const testDbPath = path.join(process.cwd(), 'test-performance.db');
  let productRepo: ProductRepository;
  let categoryRepo: CategoryRepository;
  let invoiceRepo: InvoiceRepository;
  let categoryId: string;

  beforeAll(() => {
    initializeDatabase(testDbPath);
    productRepo = new ProductRepository();
    categoryRepo = new CategoryRepository();
    invoiceRepo = new InvoiceRepository();

    // Create test category
    const category = categoryRepo.create({
      name: 'Performance Test Category',
    });
    categoryId = category.id;

    // Create 100 test products
    for (let i = 0; i < 100; i++) {
      productRepo.create({
        name: `Product ${i}`,
        barcode: `PERF${i.toString().padStart(6, '0')}`,
        categoryId,
        wholesalePrice: 10.0 + i,
        retailPrice: 15.0 + i,
        stockQuantity: 100,
      });
    }

    // Create 50 test invoices
    for (let i = 0; i < 50; i++) {
      const product = productRepo.findByBarcode(`PERF${i.toString().padStart(6, '0')}`);
      if (product) {
        invoiceRepo.save({
          invoiceNumber: `PERF-${i.toString().padStart(4, '0')}`,
          pricingType: i % 2 === 0 ? 'wholesale' : 'retail',
          items: [
            {
              productId: product.id,
              productName: product.name,
              quantity: 2,
              unitPrice: product.retailPrice,
              totalPrice: product.retailPrice * 2,
            },
          ],
          totalAmount: product.retailPrice * 2,
        });
      }
    }
  });

  afterAll(() => {
    closeDatabase();
    // Clean up test database files
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    const shmPath = `${testDbPath}-shm`;
    const walPath = `${testDbPath}-wal`;
    if (fs.existsSync(shmPath)) {
      fs.unlinkSync(shmPath);
    }
    if (fs.existsSync(walPath)) {
      fs.unlinkSync(walPath);
    }
  });

  describe('Product Queries', () => {
    it('should find product by barcode quickly (< 50ms)', () => {
      const start = performance.now();
      const product = productRepo.findByBarcode('PERF000050');
      const duration = performance.now() - start;

      expect(product).not.toBeNull();
      expect(duration).toBeLessThan(50);
    });

    it('should find all products quickly (< 100ms)', () => {
      const start = performance.now();
      const products = productRepo.findAll();
      const duration = performance.now() - start;

      expect(products.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(100);
    });

    it('should filter products by category quickly (< 100ms)', () => {
      const start = performance.now();
      const products = productRepo.findAll({ categoryId });
      const duration = performance.now() - start;

      expect(products.length).toBe(100);
      expect(duration).toBeLessThan(100);
    });
  });

  describe('Invoice Queries', () => {
    it('should find invoices by date quickly (< 100ms)', () => {
      const start = performance.now();
      const invoices = invoiceRepo.findByDate(new Date());
      const duration = performance.now() - start;

      expect(invoices.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(100);
    });

    it('should calculate total sales quickly (< 50ms)', () => {
      const start = performance.now();
      const total = invoiceRepo.getTotalSalesByDate(new Date());
      const duration = performance.now() - start;

      expect(total).toBeGreaterThan(0);
      expect(duration).toBeLessThan(50);
    });
  });

  describe('Database Indexes', () => {
    it('should have index on products.barcode', () => {
      const db = require('../../../src/database/connection').getDatabase();
      const indexes = db.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='index' AND tbl_name='products' AND name='idx_products_barcode'
      `).all();

      expect(indexes.length).toBe(1);
    });

    it('should have index on products.category_id', () => {
      const db = require('../../../src/database/connection').getDatabase();
      const indexes = db.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='index' AND tbl_name='products' AND name='idx_products_category'
      `).all();

      expect(indexes.length).toBe(1);
    });

    it('should have index on invoices.created_at', () => {
      const db = require('../../../src/database/connection').getDatabase();
      const indexes = db.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='index' AND tbl_name='invoices' AND name='idx_invoices_date'
      `).all();

      expect(indexes.length).toBe(1);
    });

    it('should have WAL mode enabled', () => {
      const db = require('../../../src/database/connection').getDatabase();
      const result = db.pragma('journal_mode', { simple: true });

      expect(result).toBe('wal');
    });
  });
});
