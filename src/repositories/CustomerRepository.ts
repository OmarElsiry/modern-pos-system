import { getDatabase } from '../database/connection';
import { Customer, CustomerInput } from '../types/models';
import { v4 as uuidv4 } from 'uuid';

/**
 * CustomerRepository - Data access layer for customers
 */
export class CustomerRepository {
  private db: any;

  constructor() {
    this.db = getDatabase();
  }

  /**
   * Create a new customer
   */
  create(input: CustomerInput): Customer {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO customers (id, name, phone, email, address, notes, total_purchases, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)
    `);

    stmt.run(
      id,
      input.name,
      input.phone || null,
      input.email || null,
      input.address || null,
      input.notes || null,
      now,
      now
    );

    return this.findById(id)!;
  }

  /**
   * Update an existing customer
   */
  update(id: string, updates: Partial<CustomerInput>): Customer {
    const now = new Date().toISOString();
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.phone !== undefined) {
      fields.push('phone = ?');
      values.push(updates.phone || null);
    }
    if (updates.email !== undefined) {
      fields.push('email = ?');
      values.push(updates.email || null);
    }
    if (updates.address !== undefined) {
      fields.push('address = ?');
      values.push(updates.address || null);
    }
    if (updates.notes !== undefined) {
      fields.push('notes = ?');
      values.push(updates.notes || null);
    }

    fields.push('updated_at = ?');
    values.push(now);
    values.push(id);

    const stmt = this.db.prepare(`
      UPDATE customers
      SET ${fields.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);

    return this.findById(id)!;
  }

  /**
   * Delete a customer
   */
  delete(id: string): void {
    const stmt = this.db.prepare('DELETE FROM customers WHERE id = ?');
    stmt.run(id);
  }

  /**
   * Find customer by ID
   */
  findById(id: string): Customer | null {
    const stmt = this.db.prepare('SELECT * FROM customers WHERE id = ?');
    const row = stmt.get(id);

    if (!row) return null;

    return this.mapRowToCustomer(row);
  }

  /**
   * Find customer by phone
   */
  findByPhone(phone: string): Customer | null {
    const stmt = this.db.prepare('SELECT * FROM customers WHERE phone = ?');
    const row = stmt.get(phone);

    if (!row) return null;

    return this.mapRowToCustomer(row);
  }

  /**
   * Find all customers with optional search
   */
  findAll(searchTerm?: string): Customer[] {
    let query = 'SELECT * FROM customers';
    const params: any[] = [];

    if (searchTerm) {
      query += ' WHERE name LIKE ? OR phone LIKE ? OR email LIKE ?';
      const searchPattern = `%${searchTerm}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    query += ' ORDER BY name ASC';

    const stmt = this.db.prepare(query);
    const rows = stmt.all(...params);

    return rows.map((row: any) => this.mapRowToCustomer(row));
  }

  /**
   * Update customer's total purchases
   */
  updateTotalPurchases(id: string, amount: number): void {
    const stmt = this.db.prepare(`
      UPDATE customers
      SET total_purchases = total_purchases + ?
      WHERE id = ?
    `);
    stmt.run(amount, id);
  }

  /**
   * Get customer purchase history
   */
  getPurchaseHistory(customerId: string): any[] {
    const stmt = this.db.prepare(`
      SELECT 
        i.id,
        i.invoice_number,
        i.total_amount,
        i.pricing_type,
        i.payment_method,
        i.created_at,
        COUNT(ii.id) as item_count
      FROM invoices i
      LEFT JOIN invoice_items ii ON i.id = ii.invoice_id
      WHERE i.customer_id = ?
      GROUP BY i.id
      ORDER BY i.created_at DESC
    `);

    const rows = stmt.all(customerId);

    return rows.map((row: any) => ({
      id: row.id,
      invoiceNumber: row.invoice_number,
      totalAmount: row.total_amount,
      pricingType: row.pricing_type,
      paymentMethod: row.payment_method,
      createdAt: new Date(row.created_at),
      itemCount: row.item_count,
      items: [] // Items are not needed for this view
    }));
  }

  /**
   * Map database row to Customer object
   */
  private mapRowToCustomer(row: any): Customer {
    return {
      id: row.id,
      name: row.name,
      phone: row.phone,
      email: row.email,
      address: row.address,
      notes: row.notes,
      totalPurchases: row.total_purchases,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
