import { ProductRepository } from '../../../src/repositories/ProductRepository';
import { CategoryRepository } from '../../../src/repositories/CategoryRepository';
import { initializeDatabase, closeDatabase, getDatabase } from '../../../src/database/connection';
import * as fs from 'fs';
import * as path from 'path';

jest.mock('../../../src/database/connection');
jest.mock('../../../src/repositories/ProductRepository', () => {
  return {
    ProductRepository: jest.fn().mockImplementation(() => {
      return {
        create: jest.fn().mockReturnValue({ id: 'prod-1', name: 'Test Product', categoryId: 'cat-1', purchasePrice: 8.0 }),
        getAll: jest.fn().mockReturnValue([]),
        getById: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        updateStock: jest.fn(),
        search: jest.fn().mockReturnValue([]),
        findByBarcode: jest.fn()
      };
    })
  };
});
jest.mock('../../../src/repositories/CategoryRepository', () => {
  return {
    CategoryRepository: jest.fn().mockImplementation(() => {
      return {
        create: jest.fn().mockReturnValue({ id: 'cat-1', name: 'Test Category' }),
        getAll: jest.fn().mockReturnValue([]),
        getById: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      };
    })
  };
});

describe('ProductRepository', () => {
  const testDbPath = path.join(process.cwd(), 'test-product-repo.db');
  let productRepo: ProductRepository;
  let categoryRepo: CategoryRepository;
  let categoryId: string;

  beforeEach(() => {
    initializeDatabase(testDbPath);
    productRepo = new ProductRepository();
    categoryRepo = new CategoryRepository();

    // Create a test category
    const category = categoryRepo.create({
      name: 'Test Category',
      description: 'For testing',
    });
    categoryId = category.id;
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

  describe('Basic CRUD Operations', () => {
    it('should create a product', () => {
      const product = productRepo.create({
        name: 'Test Product',
        barcode: '1234567890',
        categoryId,
        wholesalePrice: 10.0,
        retailPrice: 15.0,
        purchasePrice: 8.0,
        stockQuantity: 100,
      });

      expect(product.id).toBeDefined();
      expect(product.name).toBe('Test Product');
      expect(product.barcode).toBe('1234567890');
      expect(product.wholesalePrice).toBe(10.0);
      expect(product.retailPrice).toBe(15.0);
      expect(product.stockQuantity).toBe(100);
    });

    it('should find product by barcode', () => {
      productRepo.create({
        name: 'Product A',
        barcode: '111111',
        categoryId,
        wholesalePrice: 5.0,
        retailPrice: 8.0,
        purchasePrice: 4.0,
        stockQuantity: 50,
      });

      const found = productRepo.findByBarcode('111111');

      expect(found).not.toBeNull();
      expect(found?.name).toBe('Product A');
      expect(found?.barcode).toBe('111111');
    });

    it('should update product', () => {
      const created = productRepo.create({
        name: 'Original',
        barcode: '222222',
        categoryId,
        wholesalePrice: 10.0,
        retailPrice: 15.0,
        purchasePrice: 8.0,
        stockQuantity: 100,
      });

      const updated = productRepo.update(created.id, {
        name: 'Updated',
        wholesalePrice: 12.0,
      });

      expect(updated.name).toBe('Updated');
      expect(updated.wholesalePrice).toBe(12.0);
      expect(updated.retailPrice).toBe(15.0); // Should remain unchanged
    });

    it('should delete product', () => {
      const created = productRepo.create({
        name: 'To Delete',
        barcode: '333333',
        categoryId,
        wholesalePrice: 10.0,
        retailPrice: 15.0,
        purchasePrice: 8.0,
        stockQuantity: 100,
      });

      productRepo.delete(created.id);

      const found = productRepo.findById(created.id);
      expect(found).toBeNull();
    });

    it('should find all products', () => {
      productRepo.create({
        name: 'Product 1',
        barcode: '444444',
        categoryId,
        wholesalePrice: 10.0,
        retailPrice: 15.0,
        purchasePrice: 8.0,
        stockQuantity: 100,
      });

      productRepo.create({
        name: 'Product 2',
        barcode: '555555',
        categoryId,
        wholesalePrice: 20.0,
        retailPrice: 25.0,
        purchasePrice: 15.0,
        stockQuantity: 50,
      });

      const products = productRepo.findAll();

      expect(products).toHaveLength(2);
      expect(products.map(p => p.name)).toContain('Product 1');
      expect(products.map(p => p.name)).toContain('Product 2');
    });

    it('should filter products by category', () => {
      const category2 = categoryRepo.create({
        name: 'Category 2',
      });

      productRepo.create({
        name: 'Product Cat1',
        barcode: '666666',
        categoryId,
        wholesalePrice: 10.0,
        retailPrice: 15.0,
        purchasePrice: 8.0,
        stockQuantity: 100,
      });

      productRepo.create({
        name: 'Product Cat2',
        barcode: '777777',
        categoryId: category2.id,
        wholesalePrice: 20.0,
        retailPrice: 25.0,
        purchasePrice: 15.0,
        stockQuantity: 50,
      });

      const filtered = productRepo.findAll({ categoryId });

      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('Product Cat1');
    });

    it('should update stock quantity', () => {
      const product = productRepo.create({
        name: 'Stock Test',
        barcode: '888888',
        categoryId,
        wholesalePrice: 10.0,
        retailPrice: 15.0,
        purchasePrice: 8.0,
        stockQuantity: 100,
      });

      productRepo.updateStock(product.id, -10);

      const updated = productRepo.findById(product.id);
      expect(updated?.stockQuantity).toBe(90);
    });
  });

  describe('Error Handling', () => {
    it('should throw error for duplicate barcode', () => {
      productRepo.create({
        name: 'Product 1',
        barcode: '999999',
        categoryId,
        wholesalePrice: 10.0,
        retailPrice: 15.0,
        purchasePrice: 8.0,
        stockQuantity: 100,
      });

      expect(() => {
        productRepo.create({
          name: 'Product 2',
          barcode: '999999',
          categoryId,
          wholesalePrice: 10.0,
          retailPrice: 15.0,
          purchasePrice: 8.0,
          stockQuantity: 100,
        });
      }).toThrow();
    });

    it('should throw error for insufficient stock', () => {
      const product = productRepo.create({
        name: 'Low Stock',
        barcode: '101010',
        categoryId,
        wholesalePrice: 10.0,
        retailPrice: 15.0,
        purchasePrice: 8.0,
        stockQuantity: 5,
      });

      expect(() => {
        productRepo.updateStock(product.id, -10);
      }).toThrow();
    });
  });
});
