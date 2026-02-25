import { getDatabase, DatabaseError } from '../database/connection';
import { Category, CategoryInput } from '../types/models';
import { v4 as uuidv4 } from 'uuid';

/**
 * CategoryRepository - CRUD operations for categories
 * Uses prepared statements for security and performance
 * Requirements: 2.1, 2.2, 2.3, 2.4
 */
export class CategoryRepository {
  private db: any;

  constructor() {
    this.db = getDatabase();
  }

  /**
   * Create a new category
   * Requirement 2.1: Allow creating new category with name and description
   */
  create(input: CategoryInput): Category {
    try {
      const id = uuidv4();
      const createdAt = new Date();

      const stmt = this.db.prepare(`
        INSERT INTO categories (id, name, description, created_at)
        VALUES (?, ?, ?, ?)
      `);

      stmt.run(id, input.name, input.description || null, createdAt.toISOString());

      return {
        id,
        name: input.name,
        description: input.description,
        createdAt,
      };
    } catch (error) {
      const err = error as Error;
      if (err.message.includes('UNIQUE constraint failed')) {
        throw new DatabaseError(
          `Category with name "${input.name}" already exists`,
          'ERR_1001',
          err
        );
      }
      throw new DatabaseError(
        `Failed to create category: ${err.message}`,
        'ERR_2002',
        err
      );
    }
  }

  /**
   * Update an existing category
   * Requirement 2.2: Allow updating category data
   */
  update(id: string, updates: Partial<CategoryInput>): Category {
    try {
      const existing = this.findById(id);
      if (!existing) {
        throw new DatabaseError(
          `Category with id "${id}" not found`,
          'ERR_3003'
        );
      }

      const stmt = this.db.prepare(`
        UPDATE categories
        SET name = ?, description = ?
        WHERE id = ?
      `);

      stmt.run(
        updates.name ?? existing.name,
        updates.description ?? existing.description ?? null,
        id
      );

      return this.findById(id)!;
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      const err = error as Error;
      if (err.message.includes('UNIQUE constraint failed')) {
        throw new DatabaseError(
          `Category with name "${updates.name}" already exists`,
          'ERR_1001',
          err
        );
      }
      throw new DatabaseError(
        `Failed to update category: ${err.message}`,
        'ERR_2002',
        err
      );
    }
  }

  /**
   * Delete a category
   * Requirement 2.3: Allow deleting category if it has no products
   */
  delete(id: string): void {
    try {
      // Check if category has products
      const hasProducts = this.hasProducts(id);
      if (hasProducts) {
        throw new DatabaseError(
          'Cannot delete category that contains products',
          'ERR_3001'
        );
      }

      const stmt = this.db.prepare('DELETE FROM categories WHERE id = ?');
      const result = stmt.run(id);

      if (result.changes === 0) {
        throw new DatabaseError(
          `Category with id "${id}" not found`,
          'ERR_3003'
        );
      }
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      const err = error as Error;
      throw new DatabaseError(
        `Failed to delete category: ${err.message}`,
        'ERR_2002',
        err
      );
    }
  }

  /**
   * Get all categories
   * Requirement 2.4: Display all available categories
   */
  findAll(): Category[] {
    try {
      const stmt = this.db.prepare(`
        SELECT id, name, description, created_at
        FROM categories
        ORDER BY name ASC
      `);

      const rows = stmt.all() as Array<{
        id: string;
        name: string;
        description: string | null;
        created_at: string;
      }>;

      return rows.map(row => ({
        id: row.id,
        name: row.name,
        description: row.description || undefined,
        createdAt: new Date(row.created_at),
      }));
    } catch (error) {
      const err = error as Error;
      throw new DatabaseError(
        `Failed to fetch categories: ${err.message}`,
        'ERR_2001',
        err
      );
    }
  }

  /**
   * Find category by ID
   */
  findById(id: string): Category | null {
    try {
      const stmt = this.db.prepare(`
        SELECT id, name, description, created_at
        FROM categories
        WHERE id = ?
      `);

      const row = stmt.get(id) as {
        id: string;
        name: string;
        description: string | null;
        created_at: string;
      } | undefined;

      if (!row) {
        return null;
      }

      return {
        id: row.id,
        name: row.name,
        description: row.description || undefined,
        createdAt: new Date(row.created_at),
      };
    } catch (error) {
      const err = error as Error;
      throw new DatabaseError(
        `Failed to find category: ${err.message}`,
        'ERR_2001',
        err
      );
    }
  }

  /**
   * Check if category has products
   * Requirement 2.5: Prevent deleting category with products
   */
  hasProducts(categoryId: string): boolean {
    try {
      const stmt = this.db.prepare(`
        SELECT COUNT(*) as count
        FROM products
        WHERE category_id = ?
      `);

      const result = stmt.get(categoryId) as { count: number };
      return result.count > 0;
    } catch (error) {
      const err = error as Error;
      throw new DatabaseError(
        `Failed to check category products: ${err.message}`,
        'ERR_2001',
        err
      );
    }
  }
}
