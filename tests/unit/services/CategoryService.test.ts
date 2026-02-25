import { CategoryService } from '../../../src/services/CategoryService';
import { initializeDatabase, closeDatabase } from '../../../src/database/connection';
import * as path from 'path';
import * as fs from 'fs';

describe('CategoryService', () => {
  let service: CategoryService;
  const testDbPath = path.join(__dirname, '../../test-category-service.db');

  beforeEach(() => {
    // Clean up any existing test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }

    // Initialize database
    initializeDatabase(testDbPath);
    service = new CategoryService();
  });

  afterEach(() => {
    closeDatabase();
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe('createCategory', () => {
    it('should create a category successfully', async () => {
      const result = await service.createCategory({
        name: 'Electronics',
        description: 'Electronic items',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Electronics');
        expect(result.data.description).toBe('Electronic items');
      }
    });

    it('should reject empty category name', async () => {
      const result = await service.createCategory({
        name: '',
        description: 'Test',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('ERR_1002');
      }
    });
  });

  describe('updateCategory', () => {
    it('should update category successfully', async () => {
      const createResult = await service.createCategory({
        name: 'Electronics',
        description: 'Old description',
      });

      expect(createResult.success).toBe(true);
      if (!createResult.success) return;

      const updateResult = await service.updateCategory(createResult.data.id, {
        description: 'New description',
      });

      expect(updateResult.success).toBe(true);
      if (updateResult.success) {
        expect(updateResult.data.description).toBe('New description');
      }
    });
  });

  describe('deleteCategory', () => {
    it('should delete empty category successfully', async () => {
      const createResult = await service.createCategory({
        name: 'Electronics',
      });

      expect(createResult.success).toBe(true);
      if (!createResult.success) return;

      const deleteResult = await service.deleteCategory(createResult.data.id);

      expect(deleteResult.success).toBe(true);
    });
  });

  describe('getAllCategories', () => {
    it('should return all categories', async () => {
      await service.createCategory({ name: 'Category 1' });
      await service.createCategory({ name: 'Category 2' });

      const result = await service.getAllCategories();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.length).toBe(2);
      }
    });
  });
});
