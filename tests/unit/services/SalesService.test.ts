import { SalesService } from '../../../src/services/SalesService';
import { ProductService } from '../../../src/services/ProductService';
import { CategoryService } from '../../../src/services/CategoryService';
import { initializeDatabase, closeDatabase } from '../../../src/database/connection';
import * as path from 'path';
import * as fs from 'fs';

jest.mock('../../../src/database/connection');

describe('SalesService', () => {
  let service: SalesService;
  let productService: ProductService;
  let categoryService: CategoryService;
  const testDbPath = path.join(__dirname, '../../test-sales-service.db');
  let categoryId: string;
  let productBarcode: string;

  beforeEach(async () => {
    // Clean up any existing test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }

    // Initialize mock
    (initializeDatabase as jest.Mock).mockClear();
    (closeDatabase as jest.Mock).mockClear();
    service = new SalesService();
    productService = new ProductService();
    categoryService = new CategoryService();

    // Mock window.electronAPI
    const mockProducts: any[] = [];
    const mockInvoices: any[] = [];

    (global as any).window = {
      electronAPI: {
        products: {
          search: jest.fn().mockImplementation(async (barcode: string) => {
            // In a real app, this would query the DB. Here we mock it based on barcode.
            // We'll return the product we're about to create in the test setup.
            return mockProducts.filter(p => p.barcode === barcode || p.id === barcode);
          }),
          create: jest.fn().mockImplementation(async (input: any) => {
            const p = { id: Math.random().toString(), ...input };
            mockProducts.push(p);
            return p;
          }),
          updateStock: jest.fn().mockImplementation(async (id: string, qty: number) => {
            const p = mockProducts.find(x => x.id === id);
            if (p) p.stockQuantity += qty;
            return true;
          }),
          getById: jest.fn().mockImplementation(async (id: string) => {
            return mockProducts.find(x => x.id === id);
          })
        },
        invoices: {
          create: jest.fn().mockImplementation(async (data: any, items: any[]) => {
            // Simulate stock check and deduction
            for (const item of items) {
              const p = mockProducts.find(x => x.id === item.productId);
              if (p) {
                if (p.stockQuantity < item.quantity) {
                  throw new Error('Insufficient stock quantity');
                }
                p.stockQuantity -= item.quantity;
              }
            }
            const inv = { id: 'inv-' + Math.random(), invoiceNumber: 'INV-001', ...data, items, createdAt: new Date().toISOString() };
            mockInvoices.push(inv);
            return inv;
          }),
          getAll: jest.fn().mockImplementation(async () => mockInvoices)
        },
        customers: {
          getById: jest.fn().mockResolvedValue(null)
        }
      }
    };

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
      purchasePrice: 5
    });
  });

  afterEach(() => {
    closeDatabase();
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe('addProductToInvoice', () => {
    it('should add product to invoice by barcode', async () => {
      const result = await service.addProductToInvoice(productBarcode);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.items.length).toBe(1);
        expect(result.data.items[0].productName).toBe('Test Product');
        expect(result.data.items[0].quantity).toBe(1);
      }
    });

    it('should increment quantity if product already in invoice', async () => {
      await service.addProductToInvoice(productBarcode);
      const result = await service.addProductToInvoice(productBarcode);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.items.length).toBe(1);
        expect(result.data.items[0].quantity).toBe(2);
      }
    });

    it('should return error for non-existent barcode', async () => {
      const result = await service.addProductToInvoice('9999999999');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('ERR_3004');
      }
    });
  });

  describe('setPricingType', () => {
    it('should update prices when pricing type changes', async () => {
      await service.addProductToInvoice(productBarcode);

      const result = await service.setPricingType('wholesale');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.pricingType).toBe('wholesale');
        expect(result.data.items[0].unitPrice).toBe(10); // wholesale price
      }
    });
  });

  describe('updateItemQuantity', () => {
    it('should update item quantity', async () => {
      const addResult = await service.addProductToInvoice(productBarcode);
      expect(addResult.success).toBe(true);
      if (!addResult.success) return;

      const itemId = addResult.data.items[0].id;
      const result = service.updateItemQuantity(itemId, 5);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.items[0].quantity).toBe(5);
      }
    });

    it('should reject negative quantity', async () => {
      const addResult = await service.addProductToInvoice(productBarcode);
      expect(addResult.success).toBe(true);
      if (!addResult.success) return;

      const itemId = addResult.data.items[0].id;
      const result = service.updateItemQuantity(itemId, -1);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('ERR_1003');
      }
    });
  });

  describe('removeItemFromInvoice', () => {
    it('should remove item from invoice', async () => {
      const addResult = await service.addProductToInvoice(productBarcode);
      expect(addResult.success).toBe(true);
      if (!addResult.success) return;

      const itemId = addResult.data.items[0].id;
      const result = service.removeItemFromInvoice(itemId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.items.length).toBe(0);
      }
    });
  });

  describe('completeInvoice', () => {
    it('should complete invoice and deduct stock', async () => {
      await service.addProductToInvoice(productBarcode);

      const result = await service.completeInvoice();

      expect(result.success).toBe(true);

      // Check stock was deducted
      const productResult = await productService.findByBarcode(productBarcode);
      if (productResult.success) {
        expect(productResult.data.stockQuantity).toBe(99);
      }
    });

    it('should reject completing empty invoice', async () => {
      const result = await service.completeInvoice();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('ERR_1002');
      }
    });

    it('should reject if insufficient stock', async () => {
      const addResult = await service.addProductToInvoice(productBarcode);
      expect(addResult.success).toBe(true);
      if (!addResult.success) return;

      const itemId = addResult.data.items[0].id;
      service.updateItemQuantity(itemId, 200); // More than available stock

      const result = await service.completeInvoice();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('ERR_3002');
      }
    });
  });

  describe('cancelInvoice', () => {
    it('should cancel invoice and start new one', async () => {
      await service.addProductToInvoice(productBarcode);

      const result = service.cancelInvoice();

      expect(result.success).toBe(true);

      const currentInvoice = service.getCurrentInvoice();
      expect(currentInvoice?.items.length).toBe(0);
    });
  });
});
