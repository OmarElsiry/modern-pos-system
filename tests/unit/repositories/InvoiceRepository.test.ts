import { InvoiceRepository } from '../../../src/repositories/InvoiceRepository';
import { ProductRepository } from '../../../src/repositories/ProductRepository';
import { CategoryRepository } from '../../../src/repositories/CategoryRepository';
import { initializeDatabase, closeDatabase } from '../../../src/database/connection';
import * as fs from 'fs';
import * as path from 'path';

describe('InvoiceRepository', () => {
  const testDbPath = path.join(process.cwd(), 'test-invoice-repo.db');
  let invoiceRepo: InvoiceRepository;
  let productRepo: ProductRepository;
  let categoryRepo: CategoryRepository;
  let productId: string;

  beforeEach(() => {
    initializeDatabase(testDbPath);
    invoiceRepo = new InvoiceRepository();
    productRepo = new ProductRepository();
    categoryRepo = new CategoryRepository();

    // Create test data
    const category = categoryRepo.create({
      name: 'Test Category',
    });

    const product = productRepo.create({
      name: 'Test Product',
      barcode: '1234567890',
      categoryId: category.id,
      wholesalePrice: 10.0,
      retailPrice: 15.0,
      stockQuantity: 100,
    });

    productId = product.id;
  });

  afterEach(() => {
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

  describe('Basic Operations', () => {
    it('should save invoice with items', () => {
      const invoice = invoiceRepo.save({
        invoiceNumber: 'INV-0001',
        pricingType: 'retail',
        items: [
          {
            productId,
            productName: 'Test Product',
            quantity: 2,
            unitPrice: 15.0,
            totalPrice: 30.0,
          },
        ],
        totalAmount: 30.0,
      });

      expect(invoice.id).toBeDefined();
      expect(invoice.invoiceNumber).toBe('INV-0001');
      expect(invoice.pricingType).toBe('retail');
      expect(invoice.items).toHaveLength(1);
      expect(invoice.totalAmount).toBe(30.0);
      expect(invoice.createdAt).toBeInstanceOf(Date);
    });

    it('should find invoice by id', () => {
      const saved = invoiceRepo.save({
        invoiceNumber: 'INV-0002',
        pricingType: 'wholesale',
        items: [
          {
            productId,
            productName: 'Test Product',
            quantity: 5,
            unitPrice: 10.0,
            totalPrice: 50.0,
          },
        ],
        totalAmount: 50.0,
      });

      const found = invoiceRepo.findById(saved.id);

      expect(found).not.toBeNull();
      expect(found?.invoiceNumber).toBe('INV-0002');
      expect(found?.items).toHaveLength(1);
    });

    it('should find invoice by invoice number', () => {
      invoiceRepo.save({
        invoiceNumber: 'INV-0003',
        pricingType: 'retail',
        items: [
          {
            productId,
            productName: 'Test Product',
            quantity: 1,
            unitPrice: 15.0,
            totalPrice: 15.0,
          },
        ],
        totalAmount: 15.0,
      });

      const found = invoiceRepo.findByInvoiceNumber('INV-0003');

      expect(found).not.toBeNull();
      expect(found?.invoiceNumber).toBe('INV-0003');
    });

    it('should find invoices by date', () => {
      const today = new Date();

      invoiceRepo.save({
        invoiceNumber: 'INV-0004',
        pricingType: 'retail',
        items: [
          {
            productId,
            productName: 'Test Product',
            quantity: 1,
            unitPrice: 15.0,
            totalPrice: 15.0,
          },
        ],
        totalAmount: 15.0,
      });

      const invoices = invoiceRepo.findByDate(today);

      expect(invoices).toHaveLength(1);
      expect(invoices[0].invoiceNumber).toBe('INV-0004');
    });

    it('should get total sales by date', () => {
      const today = new Date();

      invoiceRepo.save({
        invoiceNumber: 'INV-0005',
        pricingType: 'retail',
        items: [
          {
            productId,
            productName: 'Test Product',
            quantity: 2,
            unitPrice: 15.0,
            totalPrice: 30.0,
          },
        ],
        totalAmount: 30.0,
      });

      invoiceRepo.save({
        invoiceNumber: 'INV-0006',
        pricingType: 'wholesale',
        items: [
          {
            productId,
            productName: 'Test Product',
            quantity: 5,
            unitPrice: 10.0,
            totalPrice: 50.0,
          },
        ],
        totalAmount: 50.0,
      });

      const total = invoiceRepo.getTotalSalesByDate(today);

      expect(total).toBe(80.0);
    });

    it('should generate invoice numbers sequentially', () => {
      const num1 = invoiceRepo.generateInvoiceNumber();
      expect(num1).toBe('INV-0001');

      invoiceRepo.save({
        invoiceNumber: num1,
        pricingType: 'retail',
        items: [
          {
            productId,
            productName: 'Test Product',
            quantity: 1,
            unitPrice: 15.0,
            totalPrice: 15.0,
          },
        ],
        totalAmount: 15.0,
      });

      const num2 = invoiceRepo.generateInvoiceNumber();
      expect(num2).toBe('INV-0002');
    });
  });

  describe('Error Handling', () => {
    it('should throw error for duplicate invoice number', () => {
      invoiceRepo.save({
        invoiceNumber: 'INV-DUPLICATE',
        pricingType: 'retail',
        items: [
          {
            productId,
            productName: 'Test Product',
            quantity: 1,
            unitPrice: 15.0,
            totalPrice: 15.0,
          },
        ],
        totalAmount: 15.0,
      });

      expect(() => {
        invoiceRepo.save({
          invoiceNumber: 'INV-DUPLICATE',
          pricingType: 'retail',
          items: [
            {
              productId,
              productName: 'Test Product',
              quantity: 1,
              unitPrice: 15.0,
              totalPrice: 15.0,
            },
          ],
          totalAmount: 15.0,
        });
      }).toThrow();
    });
  });
});
