// Use dynamic require for all Node.js modules to avoid bundling issues
// @ts-ignore
import type { Database as SqliteDatabase } from 'better-sqlite3';

const Database = typeof require !== 'undefined' ? eval('require')('better-sqlite3') : null;
const path = typeof require !== 'undefined' ? eval('require')('path') : null;
const fs = typeof require !== 'undefined' ? eval('require')('fs') : null;

let db: any | null = null;
let isInitialized = false;

export interface DatabaseConfig {
  dbPath?: string;
  readonly?: boolean;
  fileMustExist?: boolean;
}

export class DatabaseError extends Error {
  constructor(message: string, public code: string, public originalError?: Error) {
    super(message);
    this.name = 'DatabaseError';
  }
}

/**
 * Check if a column exists in a table
 */
function columnExists(db: any, tableName: string, columnName: string): boolean {
  try {
    const result = db.prepare(`PRAGMA table_info(${tableName})`).all();
    return result.some((col: any) => col.name === columnName);
  } catch (error) {
    return false;
  }
}

/**
 * Run database migrations to add new columns to existing tables
 */
function runMigrations(db: any): void {
  try {
    // Migration 1: Add min_stock_level to products
    if (!columnExists(db, 'products', 'min_stock_level')) {
      db.exec('ALTER TABLE products ADD COLUMN min_stock_level INTEGER DEFAULT 10');
      console.log('✅ Migration: Added min_stock_level to products');
    }

    // Migration 2: Add customer_id to invoices
    if (!columnExists(db, 'invoices', 'customer_id')) {
      db.exec('ALTER TABLE invoices ADD COLUMN customer_id TEXT');
      console.log('✅ Migration: Added customer_id to invoices');
    }

    // Migration 3: Add user_id to invoices
    if (!columnExists(db, 'invoices', 'user_id')) {
      db.exec('ALTER TABLE invoices ADD COLUMN user_id TEXT');
      console.log('✅ Migration: Added user_id to invoices');
    }

    // Migration 4: Add status to invoices
    if (!columnExists(db, 'invoices', 'status')) {
      db.exec("ALTER TABLE invoices ADD COLUMN status TEXT DEFAULT 'completed' CHECK(status IN ('completed', 'voided', 'refunded'))");
      console.log('✅ Migration: Added status to invoices');
    }

    // Migration 5: Add payment_method to invoices
    if (!columnExists(db, 'invoices', 'payment_method')) {
      db.exec("ALTER TABLE invoices ADD COLUMN payment_method TEXT DEFAULT 'cash'");
      console.log('✅ Migration: Added payment_method to invoices');
    }

    // Migration 6: Add notes to invoices
    if (!columnExists(db, 'invoices', 'notes')) {
      db.exec('ALTER TABLE invoices ADD COLUMN notes TEXT');
      console.log('✅ Migration: Added notes to invoices');
    }

    // Migration 7: Add metadata to products
    if (!columnExists(db, 'products', 'metadata')) {
      db.exec('ALTER TABLE products ADD COLUMN metadata TEXT');
      console.log('✅ Migration: Added metadata to products');
    }

    // Migration 8: Add purchase_price to products
    if (!columnExists(db, 'products', 'purchase_price')) {
      db.exec('ALTER TABLE products ADD COLUMN purchase_price REAL DEFAULT 0');
      console.log('✅ Migration: Added purchase_price to products');
    }

    // Migration 9: Add purchase_price to invoice_items
    if (!columnExists(db, 'invoice_items', 'purchase_price')) {
      db.exec('ALTER TABLE invoice_items ADD COLUMN purchase_price REAL DEFAULT 0');
      console.log('✅ Migration: Added purchase_price to invoice_items');
    }

    // Migration 10: Add refund_type to invoices
    if (!columnExists(db, 'invoices', 'refund_type')) {
      console.log('🔄 Migration: Attempting to add refund_type to invoices...');
      try {
        db.exec('ALTER TABLE invoices ADD COLUMN refund_type TEXT DEFAULT NULL');
        console.log('✅ Migration: Successfully added refund_type to invoices');
      } catch (e) {
        console.error('❌ Migration: Failed to add refund_type (might already exist):', e);
      }
    } else {
      console.log('ℹ️ Migration: Column refund_type already exists in invoices');
    }

    // Migration 11: Add a4_template and thermal_template to settings
    if (!columnExists(db, 'settings', 'a4_template')) {
      db.exec('ALTER TABLE settings ADD COLUMN a4_template TEXT');
      console.log('✅ Migration: Added a4_template to settings');
    }

    if (!columnExists(db, 'settings', 'thermal_template')) {
      db.exec('ALTER TABLE settings ADD COLUMN thermal_template TEXT');
      console.log('✅ Migration: Added thermal_template to settings');
    }

    // Migration 12: Add logo and visibility columns to settings
    if (!columnExists(db, 'settings', 'logo')) {
      db.exec('ALTER TABLE settings ADD COLUMN logo TEXT');
      console.log('✅ Migration: Added logo to settings');
    }

    if (!columnExists(db, 'settings', 'logo_position')) {
      db.exec("ALTER TABLE settings ADD COLUMN logo_position TEXT DEFAULT 'top-center'");
      console.log('✅ Migration: Added logo_position to settings');
    }

    if (!columnExists(db, 'settings', 'show_name')) {
      db.exec('ALTER TABLE settings ADD COLUMN show_name INTEGER DEFAULT 1');
      console.log('✅ Migration: Added show_name to settings');
    }

    if (!columnExists(db, 'settings', 'show_address')) {
      db.exec('ALTER TABLE settings ADD COLUMN show_address INTEGER DEFAULT 1');
      console.log('✅ Migration: Added show_address to settings');
    }

    if (!columnExists(db, 'settings', 'show_phone')) {
      db.exec('ALTER TABLE settings ADD COLUMN show_phone INTEGER DEFAULT 1');
      console.log('✅ Migration: Added show_phone to settings');
    }

    if (!columnExists(db, 'settings', 'auto_print')) {
      db.exec('ALTER TABLE settings ADD COLUMN auto_print INTEGER DEFAULT 1');
      console.log('✅ Migration: Added auto_print to settings');
    }

    if (!columnExists(db, 'settings', 'archive_path')) {
      db.exec('ALTER TABLE settings ADD COLUMN archive_path TEXT');
      console.log('✅ Migration: Added archive_path to settings');
    }

    // Migration 13: Add is_deleted to products
    if (!columnExists(db, 'products', 'is_deleted')) {
      db.exec('ALTER TABLE products ADD COLUMN is_deleted INTEGER DEFAULT 0');
      console.log('✅ Migration: Added is_deleted to products');
    }

    // Migration 14: Add logo2 and show_logo2 to settings
    if (!columnExists(db, 'settings', 'logo2')) {
      db.exec('ALTER TABLE settings ADD COLUMN logo2 TEXT');
      db.exec("ALTER TABLE settings ADD COLUMN logo2_position TEXT DEFAULT 'bottom-right'");
      db.exec('ALTER TABLE settings ADD COLUMN show_logo2 INTEGER DEFAULT 1');
      console.log('✅ Migration: Added Migration 14 (logo2) to settings');
    }

    // Create indexes for new columns
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);
      CREATE INDEX IF NOT EXISTS idx_invoices_user ON invoices(user_id);
      CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
      CREATE INDEX IF NOT EXISTS idx_invoices_refund_type ON invoices(refund_type);
    `);

    console.log('✅ All database migrations completed successfully');
  } catch (error) {
    console.error('⚠️ Migration error (non-fatal):', error);
    // Don't throw - migrations are optional enhancements
  }
}

/**
 * Initialize database connection with error handling
 * Implements connection pooling through singleton pattern
 * Requirements: 8.1, 8.3
 */
export function initializeDatabase(configOrPath?: DatabaseConfig | string): any {
  try {
    if (!Database) {
      throw new DatabaseError(
        'better-sqlite3 is not available. This app must run in Electron.',
        'ERR_NO_DATABASE'
      );
    }

    // Handle both old string parameter and new config object
    const config: DatabaseConfig = typeof configOrPath === 'string'
      ? { dbPath: configOrPath }
      : (configOrPath || {});

    // Return existing connection if already initialized
    if (db && isInitialized) {
      return db;
    }

    // In production, we want the database to be next to the executable (Portable mode)
    // In development, we use the current working directory (Project root)
    const isProduction = typeof process !== 'undefined' && (process.env.NODE_ENV === 'production' || !!(process as any).resourcesPath);
    const baseDir = isProduction ? path.dirname(process.execPath) : process.cwd();

    const defaultPath = path.join(baseDir, 'pos-database.db');
    const finalPath = config.dbPath || defaultPath;

    // Ensure directory exists
    const dbDir = path.dirname(finalPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Create database connection
    db = new Database(finalPath, {
      readonly: config.readonly || false,
      fileMustExist: config.fileMustExist || false,
    });

    // Enable WAL mode for better performance and concurrent access
    db.pragma('journal_mode = WAL');

    // Enable foreign keys
    db.pragma('foreign_keys = ON');

    // Set busy timeout to handle concurrent access
    db.pragma('busy_timeout = 5000');

    // Performance optimizations for low-spec devices
    db.pragma('synchronous = NORMAL'); // Balance between safety and performance
    db.pragma('cache_size = -2000'); // 2MB cache
    db.pragma('temp_store = MEMORY'); // Use memory for temp tables
    db.pragma('mmap_size = 2000000000'); // 2GB Memory-mapped I/O

    // Execute schema (embedded to avoid bundling issues)
    const schema = `
-- جدول الفئات
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- جدول المنتجات (original columns only)
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  barcode TEXT NOT NULL UNIQUE,
  category_id TEXT NOT NULL,
  wholesale_price REAL NOT NULL,
  retail_price REAL NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- جدول العملاء
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  total_purchases REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- جدول المستخدمين
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin', 'manager', 'cashier')),
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME
);

-- جدول الفواتير (original columns only)
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  pricing_type TEXT NOT NULL CHECK(pricing_type IN ('wholesale', 'retail')),
  total_amount REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- جدول عناصر الفاتورة
CREATE TABLE IF NOT EXISTS invoice_items (
  id TEXT PRIMARY KEY,
  invoice_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price REAL NOT NULL,
  total_price REAL NOT NULL,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- جدول سجل النشاطات
CREATE TABLE IF NOT EXISTS activity_log (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes للأداء
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_stock_level ON products(stock_quantity);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(created_at);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_product ON invoice_items(product_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_date ON activity_log(created_at);
`;

    // جدول سجل النشاطات
    db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        business_name TEXT DEFAULT 'بيت ورد',
        business_address TEXT,
        business_phone TEXT,
        telegram_bot_token TEXT,
        telegram_chat_id TEXT,
        is_polling_enabled INTEGER DEFAULT 0,
        a4_template TEXT,
        thermal_template TEXT,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- دراسة إدخال صف افتراضي إذا لم يكن موجوداً
      INSERT OR IGNORE INTO settings (id, business_name) VALUES (1, 'بيت ورد');
    `);

    // Execute schema statements
    db.exec(schema);

    // Run migrations to add new columns to existing tables
    runMigrations(db);

    isInitialized = true;
    return db;
  } catch (error) {
    const err = error as Error;
    throw new DatabaseError(
      `Failed to initialize database: ${err.message}`,
      'ERR_2001',
      err
    );
  }
}

/**
 * Get the current database connection
 * Throws error if database is not initialized
 */
export function getDatabase(): any {
  if (!db || !isInitialized) {
    throw new DatabaseError(
      'Database not initialized. Call initializeDatabase() first.',
      'ERR_2001'
    );
  }
  return db;
}

/**
 * Close database connection and cleanup
 */
export function closeDatabase(): void {
  if (db) {
    try {
      db.close();
    } catch (error) {
      const err = error as Error;
      throw new DatabaseError(
        `Failed to close database: ${err.message}`,
        'ERR_2001',
        err
      );
    } finally {
      db = null;
      isInitialized = false;
    }
  }
}

/**
 * Check if database is initialized
 */
export function isDatabaseInitialized(): boolean {
  return isInitialized && db !== null;
}

/**
 * Execute a transaction with automatic rollback on error
 */
export function executeTransaction<T>(
  callback: (db: SqliteDatabase) => T
): T {
  const database = getDatabase();

  try {
    database.exec('BEGIN TRANSACTION');
    const result = callback(database);
    database.exec('COMMIT');
    return result;
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  }
}
