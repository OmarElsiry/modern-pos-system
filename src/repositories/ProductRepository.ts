import { getDatabase, DatabaseError } from '../database/connection';
import { Product, ProductInput, ProductFilters } from '../types/models';
import { v4 as uuidv4 } from 'uuid';

/**
 * ProductRepository - CRUD operations for products
 * Uses prepared statements for security and performance
 * Requirements: 1.1, 1.2, 1.3, 1.4
 */
export class ProductRepository {
  private db: any;

  constructor() {
    this.db = getDatabase();
  }

  /**
   * Create a new product
   * Requirement 1.1: Allow adding new product with all details
   */
  create(input: ProductInput): Product {
    try {
      const id = uuidv4();
      const now = new Date();

      const stmt = this.db.prepare(`
        INSERT INTO products (
          id, name, barcode, category_id, 
          wholesale_price, retail_price, purchase_price, stock_quantity,
          min_stock_level, metadata, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        id,
        input.name,
        input.barcode,
        input.categoryId,
        input.wholesalePrice,
        input.retailPrice,
        input.purchasePrice || 0,
        input.stockQuantity,
        input.minStockLevel || 10,
        input.metadata ? JSON.stringify(input.metadata) : null,
        now.toISOString(),
        now.toISOString()
      );

      return {
        id,
        name: input.name,
        barcode: input.barcode,
        categoryId: input.categoryId,
        wholesalePrice: input.wholesalePrice,
        retailPrice: input.retailPrice,
        purchasePrice: input.purchasePrice || 0,
        stockQuantity: input.stockQuantity,
        minStockLevel: input.minStockLevel || 10,
        metadata: input.metadata,
        createdAt: now,
        updatedAt: now,
      };
    } catch (error) {
      const err = error as Error;
      if (err.message.includes('UNIQUE constraint failed: products.barcode')) {
        throw new DatabaseError(
          `Product with barcode "${input.barcode}" already exists`,
          'ERR_1001',
          err
        );
      }
      if (err.message.includes('FOREIGN KEY constraint failed')) {
        throw new DatabaseError(
          `Category with id "${input.categoryId}" does not exist`,
          'ERR_2003',
          err
        );
      }
      throw new DatabaseError(
        `Failed to create product: ${err.message}`,
        'ERR_2002',
        err
      );
    }
  }

  /**
   * Update an existing product
   * Requirement 1.2: Allow updating product data
   */
  update(id: string, updates: Partial<ProductInput>): Product {
    try {
      const existing = this.findById(id);
      if (!existing) {
        throw new DatabaseError(
          `Product with id "${id}" not found`,
          'ERR_3003'
        );
      }

      const now = new Date();

      const stmt = this.db.prepare(`
        UPDATE products
        SET name = ?,
            barcode = ?,
            category_id = ?,
            wholesale_price = ?,
            retail_price = ?,
            purchase_price = ?,
            stock_quantity = ?,
            min_stock_level = ?,
            metadata = ?,
            updated_at = ?
        WHERE id = ?
      `);

      stmt.run(
        updates.name ?? existing.name,
        updates.barcode ?? existing.barcode,
        updates.categoryId ?? existing.categoryId,
        updates.wholesalePrice ?? existing.wholesalePrice,
        updates.retailPrice ?? existing.retailPrice,
        updates.purchasePrice ?? existing.purchasePrice,
        updates.stockQuantity ?? existing.stockQuantity,
        updates.minStockLevel ?? existing.minStockLevel,
        updates.metadata ? JSON.stringify(updates.metadata) : (existing.metadata ? JSON.stringify(existing.metadata) : null),
        now.toISOString(),
        id
      );

      return this.findById(id)!;
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      const err = error as Error;
      if (err.message.includes('UNIQUE constraint failed: products.barcode')) {
        throw new DatabaseError(
          `Product with barcode "${updates.barcode}" already exists`,
          'ERR_1001',
          err
        );
      }
      if (err.message.includes('FOREIGN KEY constraint failed')) {
        throw new DatabaseError(
          `Category with id "${updates.categoryId}" does not exist`,
          'ERR_2003',
          err
        );
      }
      throw new DatabaseError(
        `Failed to update product: ${err.message}`,
        'ERR_2002',
        err
      );
    }
  }

  /**
 * Delete a product
 * Requirement 1.3: Allow deleting product from database
 * Updated to Soft-Delete to preserve historical records and free barcode uniqueness
 */
  delete(id: string): void {
    try {
      // Suffix barcode with timestamp to allow re-use of the original barcode
      const stmt = this.db.prepare(`
      UPDATE products 
      SET is_deleted = 1, 
          barcode = barcode || '_del_' || STRFTIME('%s', 'now') 
      WHERE id = ? AND is_deleted = 0
    `);
      const result = stmt.run(id);

      if (result.changes === 0) {
        throw new DatabaseError(
          `Product with id "${id}" not found or already deleted`,
          'ERR_3003'
        );
      }
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      const err = error as Error;
      throw new DatabaseError(
        `Failed to delete product: ${err.message}`,
        'ERR_2002',
        err
      );
    }
  }

  /**
   * Find product by barcode
   * Requirement 1.4: Search by barcode
   */
  findByBarcode(barcode: string): Product | null {
    try {
      const stmt = this.db.prepare(`
      SELECT id, name, barcode, category_id, 
             wholesale_price, retail_price, purchase_price, stock_quantity,
             min_stock_level, metadata, created_at, updated_at, is_deleted
      FROM products
      WHERE barcode = ? AND is_deleted = 0
    `);

      const row = stmt.get(barcode) as any;

      if (!row) {
        return null;
      }

      return this.mapRowToProduct(row);
    } catch (error) {
      const err = error as Error;
      throw new DatabaseError(
        `Failed to find product by barcode: ${err.message}`,
        'ERR_2001',
        err
      );
    }
  }

  /**
   * Find product by ID
   */
  findById(id: string): Product | null {
    try {
      const stmt = this.db.prepare(`
      SELECT p.id, p.name, p.barcode, p.category_id, 
             p.wholesale_price, p.retail_price, p.purchase_price, p.stock_quantity as stockQuantity,
             p.min_stock_level, p.metadata, p.created_at, p.updated_at, p.is_deleted,
             c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ? AND p.is_deleted = 0
    `);

      const row = stmt.get(id) as any;

      if (!row) {
        return null;
      }

      return this.mapRowToProduct(row);
    } catch (error) {
      const err = error as Error;
      throw new DatabaseError(
        `Failed to find product: ${err.message}`,
        'ERR_2001',
        err
      );
    }
  }

  /**
   * Get all products with optional filters
   * Requirement 1.4: Display products with search and filter by category
   */
  findAll(filters?: ProductFilters): Product[] {
    try {
      let query = `
      SELECT p.id, p.name, p.barcode, p.category_id, 
             p.wholesale_price, p.retail_price, p.purchase_price, p.stock_quantity as stockQuantity,
             p.min_stock_level, p.metadata, p.created_at, p.updated_at, p.is_deleted,
             c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_deleted = 0
    `;
      const params: any[] = [];

      if (filters?.categoryId) {
        query += ' AND p.category_id = ?';
        params.push(filters.categoryId);
      }

      if (filters?.searchTerm) {
        query += ' AND (p.name LIKE ? OR p.barcode LIKE ?)';
        const searchPattern = `%${filters.searchTerm}%`;
        params.push(searchPattern, searchPattern);
      }

      query += ' ORDER BY p.name ASC';

      const stmt = this.db.prepare(query);
      const rows = stmt.all(...params) as any[];

      return rows.map(row => this.mapRowToProduct(row));
    } catch (error) {
      const err = error as Error;
      throw new DatabaseError(
        `Failed to fetch products: ${err.message}`,
        'ERR_2001',
        err
      );
    }
  }

  /**
   * Update product stock quantity
   * Requirement 1.4: Update inventory
   */
  updateStock(productId: string, quantity: number): void {
    try {
      const product = this.findById(productId);
      if (!product) {
        throw new DatabaseError(
          `Product with id "${productId}" not found`,
          'ERR_3003'
        );
      }

      const newQuantity = product.stockQuantity + quantity;

      if (newQuantity < 0) {
        throw new DatabaseError(
          'Insufficient stock quantity',
          'ERR_3002'
        );
      }

      const stmt = this.db.prepare(`
        UPDATE products
        SET stock_quantity = ?, updated_at = ?
        WHERE id = ? AND is_deleted = 0
      `);

      stmt.run(newQuantity, new Date().toISOString(), productId);
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      const err = error as Error;
      throw new DatabaseError(
        `Failed to update stock: ${err.message}`,
        'ERR_2002',
        err
      );
    }
  }

  /**
   * Helper method to map database row to Product object
   */
  private mapRowToProduct(row: any): Product {
    return {
      id: row.id,
      name: row.name,
      barcode: row.barcode,
      categoryId: row.category_id,
      wholesalePrice: row.wholesale_price,
      retailPrice: row.retail_price,
      purchasePrice: row.purchase_price || 0,
      stockQuantity: row.stockQuantity !== undefined ? row.stockQuantity : row.stock_quantity,
      minStockLevel: row.min_stock_level,
      categoryName: row.category_name,
      metadata: row.metadata ? JSON.parse(row.metadata) : {},
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      is_deleted: Boolean(row.is_deleted),
    };
  }
}
