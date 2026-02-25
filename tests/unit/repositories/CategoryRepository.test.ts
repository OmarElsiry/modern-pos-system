import { CategoryRepository } from '../../../src/repositories/CategoryRepository';
import { initializeDatabase, closeDatabase } from '../../../src/database/connection';
import * as fs from 'fs';
import * as path from 'path';

describe('CategoryRepository', () => {
  const testDbPath = path.join(process.cwd(), 'test-category-repo.db');
  let repository: CategoryRepository;

  beforeEach(() => {
    initializeDatabase(testDbPath);
    repository = new CategoryRepository();
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
    it('should create a category', () => {
      const category = repository.create({
        name: 'Electronics',
        description: 'Electronic items',
      });

      expect(category.id).toBeDefined();
      expect(category.name).toBe('Electronics');
      expect(category.description).toBe('Electronic items');
      expect(category.createdAt).toBeInstanceOf(Date);
    });

    it('should find category by id', () => {
      const created = repository.create({
        name: 'Clothing',
        description: 'Clothing items',
      });

      const found = repository.findById(created.id);

      expect(found).not.toBeNull();
      expect(found?.id).toBe(created.id);
      expect(found?.name).toBe('Clothing');
    });

    it('should update category', () => {
      const created = repository.create({
        name: 'Food',
        description: 'Food items',
      });

      const updated = repository.update(created.id, {
        name: 'Groceries',
        description: 'Grocery items',
      });

      expect(updated.name).toBe('Groceries');
      expect(updated.description).toBe('Grocery items');
    });

    it('should delete category', () => {
      const created = repository.create({
        name: 'Toys',
        description: 'Toy items',
      });

      repository.delete(created.id);

      const found = repository.findById(created.id);
      expect(found).toBeNull();
    });

    it('should find all categories', () => {
      repository.create({ name: 'Category 1' });
      repository.create({ name: 'Category 2' });
      repository.create({ name: 'Category 3' });

      const categories = repository.findAll();

      expect(categories).toHaveLength(3);
      expect(categories.map(c => c.name)).toContain('Category 1');
      expect(categories.map(c => c.name)).toContain('Category 2');
      expect(categories.map(c => c.name)).toContain('Category 3');
    });
  });

  describe('Error Handling', () => {
    it('should throw error for duplicate category name', () => {
      repository.create({ name: 'Duplicate' });

      expect(() => {
        repository.create({ name: 'Duplicate' });
      }).toThrow();
    });

    it('should throw error when updating non-existent category', () => {
      expect(() => {
        repository.update('non-existent-id', { name: 'Updated' });
      }).toThrow();
    });

    it('should throw error when deleting non-existent category', () => {
      expect(() => {
        repository.delete('non-existent-id');
      }).toThrow();
    });
  });
});
