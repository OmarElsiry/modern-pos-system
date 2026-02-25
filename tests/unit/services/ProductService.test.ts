import { ProductService } from '../../../src/services/ProductService';
import { CategoryService } from '../../../src/services/CategoryService';
import { initializeDatabase, closeDatabase } from '../../../src/database/connection';
import * as path from 'path';
import * as fs from 'fs';

describe('ProductService', () => {
  let service: ProductService;
  let categoryService: CategoryService;
  const testDbPath = path.join(__dirname, '../../test-product-service.db');
  let categoryId: string;

  beforeEach(async () => {
    // Clean up any existing test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }

    // Initialize database
    initializeDatabase(testDbPath);
    service = new ProductService();
    categoryService = new CategoryService();

    // Mock window.electronAPI
    const mockProducts: any[] = [];
    (global as any).window = {
      electronAPI: {
        products: {
          create: jest.fn().mockImplementation(async (input: any) => {
            if (input.wholesalePrice < 0 || input.retailPrice < 0) {
              const err = new Error('Invalid input');
              (err as any).code = 'ERR_1002';
              throw err;
            }
            if (mockProducts.find(p => p.barcode === input.barcode)) {
              const err = new Error('Duplicate barcode');
              (err as any).code = 'ERR_1001';
              throw err;
            }
            const p = { id: Math.random().toString(), ...input, createdAt: new Date(), updatedAt: new Date() };
            mockProducts.push(p);
            return p;
          }),
          update: jest.fn().mockImplementation(async (id: string, updates: any) => {
            const idx = mockProducts.findIndex(p => p.id === id);
            if (idx !== -1) {
              mockProducts[idx] = { ...mockProducts[idx], ...updates, updatedAt: new Date() };
              return mockProducts[idx];
            }
            throw new Error('Product not found');
          }),
          delete: jest.fn().mockImplementation(async (id: string) => {
            const idx = mockProducts.findIndex(p => p.id === id);
            if (idx !== -1) mockProducts.splice(idx, 1);
            return true;
          }),
          search: jest.fn().mockImplementation(async (query: string) => {
            return mockProducts.filter(p => p.name.includes(query) || p.barcode === query);
          }),
          getAll: jest.fn().mockImplementation(async () => mockProducts),
          getById: jest.fn().mockImplementation(async (id: string) => {
            return mockProducts.find(p => p.id === id);
          }),
          updateStock: jest.fn().mockImplementation(async (id: string, qty: number) => {
            const p = mockProducts.find(x => x.id === id);
            if (p) p.stockQuantity += qty;
            return true;
          })
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
  });

  afterEach(() => {
    closeDatabase();
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe('createProduct', () => {
    it('should create a product successfully', async () => {
      const result = await service.createProduct({
        name: 'Test Product',
        barcode: '1234567890',
        categoryId,
        wholesalePrice: 10,
        retailPrice: 15,
        purchasePrice: 5,
        stockQuantity: 100,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Test Product');
        expect(result.data.barcode).toBe('1234567890');
      }
    });

    it('should reject negative prices', async () => {
      const result = await service.createProduct({
        name: 'Test Product',
        barcode: '1234567890',
        categoryId,
        wholesalePrice: -10,
        retailPrice: 15,
        purchasePrice: 5,
        stockQuantity: 100,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('ERR_1002');
      }
    });

    it('should reject duplicate barcode', async () => {
      await service.createProduct({
        name: 'Product 1',
        barcode: '1234567890',
        categoryId,
        wholesalePrice: 10,
        retailPrice: 15,
        purchasePrice: 5,
        stockQuantity: 100,
      });

      const result = await service.createProduct({
        name: 'Product 2',
        barcode: '1234567890',
        categoryId,
        wholesalePrice: 10,
        retailPrice: 15,
        purchasePrice: 5,
        stockQuantity: 100,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('ERR_1001');
      }
    });
  });

  describe('findByBarcode', () => {
    it('should find product by barcode', async () => {
      await service.createProduct({
        name: 'Test Product',
        barcode: '1234567890',
        categoryId,
        wholesalePrice: 10,
        retailPrice: 15,
        purchasePrice: 5,
        stockQuantity: 100,
      });

      const result = await service.findByBarcode('1234567890');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Test Product');
      }
    });

    it('should return error for non-existent barcode', async () => {
      const result = await service.findByBarcode('9999999999');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('ERR_3004');
      }
    });
  });

  describe('updateStock', () => {
    it('should update stock quantity', async () => {
      const createResult = await service.createProduct({
        name: 'Test Product',
        barcode: '1234567890',
        categoryId,
        wholesalePrice: 10,
        retailPrice: 15,
        purchasePrice: 5,
        stockQuantity: 100,
      });

      expect(createResult.success).toBe(true);
      if (!createResult.success) return;

      const updateResult = await service.updateStock(createResult.data.id, -10);

      expect(updateResult.success).toBe(true);

      const getResult = await service.getProductById(createResult.data.id);
      if (getResult.success) {
        expect(getResult.data.stockQuantity).toBe(90);
      }
    });
  });
});
