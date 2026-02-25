import { getDatabase, DatabaseError, executeTransaction } from '../database/connection';
import { Invoice, InvoiceItem, PricingType } from '../types/models';
import { v4 as uuidv4 } from 'uuid';

/**
 * InvoiceRepository - Operations for invoices and invoice items
 * Uses prepared statements and transactions for data integrity
 * Requirements: 5.1, 5.2, 6.1, 6.2
 */
export class InvoiceRepository {
  private db: any;

  constructor() {
    this.db = getDatabase();
  }

  /**
   * Save invoice with all items in a transaction
   * Requirement 5.1: Save invoice to database
   * Requirement 5.2: Record all invoice data (date, products, quantities, prices, total, pricing type)
   */
  save(invoice: Omit<Invoice, 'id' | 'createdAt'>): Invoice {
    try {
      return executeTransaction((db) => {
        const id = uuidv4();
        const createdAt = new Date();

        // Generate invoice number if not provided
        let invoiceNumber = invoice.invoiceNumber;
        if (!invoiceNumber || invoiceNumber === '') {
          const lastInvoiceStmt = db.prepare(`
            SELECT invoice_number
            FROM invoices
            ORDER BY created_at DESC
            LIMIT 1
          `);
          const row = lastInvoiceStmt.get() as { invoice_number: string } | undefined;

          if (!row) {
            invoiceNumber = 'INV-0001';
          } else {
            const lastPart = row.invoice_number.split('-')[1];
            const lastNumber = parseInt(lastPart);
            const nextNumber = isNaN(lastNumber) ? 1 : lastNumber + 1;
            invoiceNumber = `INV-${nextNumber.toString().padStart(4, '0')}`;
          }
        }

        // Insert invoice
        // Insert invoice
        const invoiceStmt = db.prepare(`
          INSERT INTO invoices (
            id, invoice_number, pricing_type, total_amount, 
            customer_id, user_id, status, payment_method, notes,
            created_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        try {
          invoiceStmt.run(
            id,
            invoiceNumber,
            invoice.pricingType,
            invoice.totalAmount,
            (invoice.customerId && invoice.customerId.trim() !== '') ? invoice.customerId : null,
            (invoice.userId && invoice.userId.trim() !== '') ? invoice.userId : null,
            invoice.status || 'completed',
            invoice.paymentMethod || 'cash',
            invoice.notes || null,
            createdAt.toISOString()
          );
        } catch (error) {
          const err = error as Error;
          if (err.message.includes('FOREIGN KEY constraint failed')) {
            throw new Error(`Foreign Key constraint failed on Invoice insert. CustomerID: ${invoice.customerId}, UserID: ${invoice.userId}. Ensure these exist.`);
          }
          throw error;
        }

        // Insert invoice items and update stock level
        const itemStmt = db.prepare(`
          INSERT INTO invoice_items (
            id, invoice_id, product_id, product_name,
            quantity, unit_price, total_price, purchase_price
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        // Get product purchase price statement
        const getProductCostStmt = db.prepare(`
          SELECT purchase_price FROM products WHERE id = ?
        `);

        // Update product stock statement
        const updateStockStmt = db.prepare(`
          UPDATE products 
          SET stock_quantity = stock_quantity - ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `);

        const savedItems: InvoiceItem[] = [];

        for (const item of invoice.items) {
          const itemId = uuidv4();

          // 0. Get current cost from product
          const productRow = getProductCostStmt.get(item.productId) as { purchase_price: number } | undefined;
          const costPrice = productRow?.purchase_price || 0;


          // 1. Save item detail
          try {
            itemStmt.run(
              itemId,
              id,
              item.productId,
              item.productName,
              item.quantity,
              item.unitPrice,
              item.totalPrice,
              costPrice
            );
          } catch (error) {
            const err = error as Error;
            if (err.message.includes('FOREIGN KEY constraint failed')) {
              throw new Error(`Foreign Key constraint failed on Invoice Item insert. Product ID: ${item.productId}. Ensure this product exists.`);
            }
            throw error;
          }

          // 2. Deduct stock
          updateStockStmt.run(item.quantity, item.productId);

          savedItems.push({
            id: itemId,
            invoiceId: id,
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          });
        }

        return {
          id,
          invoiceNumber,
          pricingType: invoice.pricingType,
          items: savedItems,
          totalAmount: invoice.totalAmount,
          createdAt,
        };
      });
    } catch (error) {
      const err = error as Error;
      if (err.message.includes('UNIQUE constraint failed: invoices.invoice_number')) {
        throw new DatabaseError(
          `Invoice with number "${invoice.invoiceNumber}" already exists`,
          'ERR_1001',
          err
        );
      }
      throw new DatabaseError(
        `Failed to save invoice: ${err.message}`,
        'ERR_2002',
        err
      );
    }
  }

  /**
   * Find invoice by ID with all items
   */
  findById(id: string): Invoice | null {
    try {
      const invoiceStmt = this.db.prepare(`
        SELECT i.id, i.invoice_number, i.pricing_type, i.total_amount, i.customer_id, i.user_id, i.status, i.refund_type, i.payment_method, i.notes, i.created_at,
               c.name as customer_name,
               (SELECT COUNT(*) FROM invoice_items ii WHERE ii.invoice_id = i.id) as item_count
        FROM invoices i
        LEFT JOIN customers c ON i.customer_id = c.id
        WHERE i.id = ?
      `);

      const invoiceRow = invoiceStmt.get(id) as any;

      if (!invoiceRow) {
        return null;
      }

      const itemsStmt = this.db.prepare(`
        SELECT id, invoice_id, product_id, product_name,
               quantity, unit_price, total_price, purchase_price
        FROM invoice_items
        WHERE invoice_id = ?
      `);

      const itemRows = itemsStmt.all(id) as any[];

      return {
        id: invoiceRow.id,
        invoiceNumber: invoiceRow.invoice_number,
        pricingType: invoiceRow.pricing_type as PricingType,
        items: itemRows.map(row => ({
          id: row.id,
          invoiceId: row.invoice_id,
          productId: row.product_id,
          productName: row.product_name,
          quantity: row.quantity,
          unitPrice: row.unit_price,
          totalPrice: row.total_price,
        })),
        totalAmount: invoiceRow.total_amount,
        customerId: invoiceRow.customer_id,
        userId: invoiceRow.user_id,
        status: invoiceRow.status,
        refundType: invoiceRow.refund_type || undefined,
        paymentMethod: invoiceRow.payment_method,
        notes: invoiceRow.notes,
        customerName: invoiceRow.customer_name,
        itemCount: invoiceRow.item_count,
        createdAt: new Date(invoiceRow.created_at),
      };
    } catch (error) {
      const err = error as Error;
      throw new DatabaseError(
        `Failed to find invoice: ${err.message}`,
        'ERR_2001',
        err
      );
    }
  }

  /**
   * Find invoice by invoice number
   */
  findByInvoiceNumber(invoiceNumber: string): Invoice | null {
    try {
      const stmt = this.db.prepare(`
        SELECT id
        FROM invoices
        WHERE invoice_number = ?
      `);

      const row = stmt.get(invoiceNumber) as { id: string } | undefined;

      if (!row) {
        return null;
      }

      return this.findById(row.id);
    } catch (error) {
      const err = error as Error;
      throw new DatabaseError(
        `Failed to find invoice by number: ${err.message}`,
        'ERR_2001',
        err
      );
    }
  }

  /**
   * Get invoices for a specific date
   * Requirement 6.1: Daily sales report
   */
  findByDate(date: Date): Invoice[] {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const stmt = this.db.prepare(`
        SELECT id
        FROM invoices
        WHERE created_at >= ? AND created_at <= ?
        ORDER BY created_at DESC
      `);

      const rows = stmt.all(
        startOfDay.toISOString(),
        endOfDay.toISOString()
      ) as Array<{ id: string }>;

      return rows.map(row => this.findById(row.id)!).filter(Boolean);
    } catch (error) {
      const err = error as Error;
      throw new DatabaseError(
        `Failed to find invoices by date: ${err.message}`,
        'ERR_2001',
        err
      );
    }
  }

  /**
   * Get invoices for a date range
   * Requirement 6.2: Period sales report
   */
  findByDateRange(startDate: Date, endDate: Date): Invoice[] {
    try {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const stmt = this.db.prepare(`
        SELECT id
        FROM invoices
        WHERE created_at >= ? AND created_at <= ?
        ORDER BY created_at DESC
      `);

      const rows = stmt.all(
        start.toISOString(),
        end.toISOString()
      ) as Array<{ id: string }>;

      return rows.map(row => this.findById(row.id)!).filter(Boolean);
    } catch (error) {
      const err = error as Error;
      throw new DatabaseError(
        `Failed to find invoices by date range: ${err.message}`,
        'ERR_2001',
        err
      );
    }
  }



  /**
   * Get total sales for a date
   */
  getTotalSalesByDate(date: Date): number {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const stmt = this.db.prepare(`
        SELECT COALESCE(SUM(total_amount), 0) as total
        FROM invoices
        WHERE created_at >= ? AND created_at <= ?
          AND (status IS NULL OR status = 'completed')
      `);

      const result = stmt.get(
        startOfDay.toISOString(),
        endOfDay.toISOString()
      ) as { total: number };

      return result.total;
    } catch (error) {
      const err = error as Error;
      throw new DatabaseError(
        `Failed to get total sales: ${err.message}`,
        'ERR_2001',
        err
      );
    }
  }

  /**
   * Get total sales for a date range
   */
  getTotalSalesByDateRange(startDate: Date, endDate: Date): number {
    try {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const stmt = this.db.prepare(`
        SELECT COALESCE(SUM(total_amount), 0) as total
        FROM invoices
        WHERE created_at >= ? AND created_at <= ?
          AND (status IS NULL OR status = 'completed')
      `);

      const result = stmt.get(
        start.toISOString(),
        end.toISOString()
      ) as { total: number };

      return result.total;
    } catch (error) {
      const err = error as Error;
      throw new DatabaseError(
        `Failed to get total sales by range: ${err.message}`,
        'ERR_2001',
        err
      );
    }
  }

  /**
   * Get sales grouped by pricing type for a date range
   */
  getSalesByPricingType(startDate: Date, endDate: Date): { wholesale: number; retail: number } {
    try {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const stmt = this.db.prepare(`
        SELECT 
          pricing_type,
          COALESCE(SUM(total_amount), 0) as total
        FROM invoices
        WHERE created_at >= ? AND created_at <= ?
          AND (status IS NULL OR status = 'completed')
        GROUP BY pricing_type
      `);

      const rows = stmt.all(
        start.toISOString(),
        end.toISOString()
      ) as Array<{ pricing_type: string; total: number }>;

      const result = { wholesale: 0, retail: 0 };

      for (const row of rows) {
        if (row.pricing_type === 'wholesale') {
          result.wholesale = row.total;
        } else if (row.pricing_type === 'retail') {
          result.retail = row.total;
        }
      }

      return result;
    } catch (error) {
      const err = error as Error;
      throw new DatabaseError(
        `Failed to get sales by pricing type: ${err.message}`,
        'ERR_2001',
        err
      );
    }
  }

  /**
   * Generate next invoice number
   */
  generateInvoiceNumber(): string {
    try {
      const stmt = this.db.prepare(`
        SELECT invoice_number
        FROM invoices
        ORDER BY created_at DESC
        LIMIT 1
      `);

      const row = stmt.get() as { invoice_number: string } | undefined;

      if (!row) {
        return 'INV-0001';
      }

      const lastNumber = parseInt(row.invoice_number.split('-')[1]);
      const nextNumber = lastNumber + 1;

      return `INV-${nextNumber.toString().padStart(4, '0')}`;
    } catch (error) {
      const err = error as Error;
      throw new DatabaseError(
        `Failed to generate invoice number: ${err.message}`,
        'ERR_2001',
        err
      );
    }
  }

  /**
   * Find all invoices
   */
  findAll(limit?: number): Invoice[] {
    try {
      let query = `
        SELECT i.id, i.invoice_number, i.pricing_type, i.total_amount, i.customer_id, i.user_id, i.status, i.refund_type, i.payment_method, i.notes, i.created_at,
               c.name as customer_name,
               (SELECT COUNT(*) FROM invoice_items ii WHERE ii.invoice_id = i.id) as item_count
        FROM invoices i
        LEFT JOIN customers c ON i.customer_id = c.id
        ORDER BY i.created_at DESC
      `;

      if (limit) {
        query += ` LIMIT ${limit}`;
      }

      const stmt = this.db.prepare(query);
      const rows = stmt.all() as any[];

      return rows.map(row => ({
        id: row.id,
        invoiceNumber: row.invoice_number,
        pricingType: row.pricing_type as PricingType,
        items: [], // Items loaded separately
        totalAmount: row.total_amount,
        customerId: row.customer_id,
        userId: row.user_id,
        status: row.status,
        refundType: row.refund_type || undefined,
        paymentMethod: row.payment_method,
        notes: row.notes,
        customerName: row.customer_name,
        itemCount: row.item_count,
        createdAt: new Date(row.created_at),
      }));
    } catch (error) {
      const err = error as Error;
      throw new DatabaseError(
        `Failed to find invoices: ${err.message}`,
        'ERR_2001',
        err
      );
    }
  }

  /**
   * Get invoice items
   */
  getInvoiceItems(invoiceId: string): InvoiceItem[] {
    try {
      const stmt = this.db.prepare(`
        SELECT id, invoice_id, product_id, product_name,
               quantity, unit_price, total_price
        FROM invoice_items
        WHERE invoice_id = ?
      `);

      const rows = stmt.all(invoiceId) as any[];

      return rows.map(row => ({
        id: row.id,
        invoiceId: row.invoice_id,
        productId: row.product_id,
        productName: row.product_name,
        quantity: row.quantity,
        unitPrice: row.unit_price,
        totalPrice: row.total_price,
      }));
    } catch (error) {
      const err = error as Error;
      throw new DatabaseError(
        `Failed to get invoice items: ${err.message}`,
        'ERR_2001',
        err
      );
    }
  }

  /**
     * Refund an invoice
     * Marks as refunded and conditionally restores stock levels
     * Requirement 5.3: Refund workflow
     * @param refundType - 'defective' skips stock restore; 'good_condition' restores stock
     */
  refund(id: string, refundType: 'defective' | 'good_condition' = 'good_condition'): void {
    try {
      executeTransaction((db) => {
        // 1. Get the items for this invoice
        const itemsStmt = db.prepare(`
          SELECT product_id, quantity FROM invoice_items WHERE invoice_id = ?
        `);
        const items = itemsStmt.all(id) as Array<{ product_id: string; quantity: number }>;

        // 2. Mark invoice as refunded with the refund type
        const updateInvoiceStmt = db.prepare(`
          UPDATE invoices SET status = 'refunded', refund_type = ? WHERE id = ?
        `);
        updateInvoiceStmt.run(refundType, id);

        // 3. Decrement customer totalPurchases
        const invoiceRow = db.prepare(`
          SELECT total_amount, customer_id FROM invoices WHERE id = ?
        `).get(id) as { total_amount: number; customer_id: string | null } | undefined;

        if (invoiceRow && invoiceRow.customer_id) {
          db.prepare(`
            UPDATE customers SET total_purchases = MAX(0, total_purchases - ?) WHERE id = ?
          `).run(invoiceRow.total_amount, invoiceRow.customer_id);
        }

        // 4. Only restore stock if the product is in good condition
        if (refundType === 'good_condition') {
          const updateStockStmt = db.prepare(`
            UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?
          `);

          for (const item of items) {
            updateStockStmt.run(item.quantity, item.product_id);
          }
        }
        // For 'defective': no stock restoration — product is damaged
      });
    } catch (error) {
      const err = error as Error;
      throw new DatabaseError(
        `Failed to refund invoice: ${err.message}`,
        'ERR_2004',
        err
      );
    }
  }
}
