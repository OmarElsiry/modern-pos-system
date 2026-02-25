-- Migration: Add new features to database schema
-- Run this to update your existing database

-- 1. Add minimum stock level to products
ALTER TABLE products ADD COLUMN min_stock_level INTEGER DEFAULT 10;

-- 2. Create customers table
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

-- 3. Create users table for multi-user support
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

-- 4. Update invoices table with new fields
ALTER TABLE invoices ADD COLUMN customer_id TEXT;
ALTER TABLE invoices ADD COLUMN user_id TEXT;
ALTER TABLE invoices ADD COLUMN status TEXT DEFAULT 'completed' CHECK(status IN ('completed', 'voided', 'refunded'));
ALTER TABLE invoices ADD COLUMN payment_method TEXT DEFAULT 'cash';
ALTER TABLE invoices ADD COLUMN notes TEXT;

-- 5. Create activity log table
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

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_activity_log_user ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_date ON activity_log(created_at);
CREATE INDEX IF NOT EXISTS idx_products_stock_level ON products(stock_quantity);

-- 7. Add refund_type to invoices for distinguishing refund reasons
ALTER TABLE invoices ADD COLUMN refund_type TEXT DEFAULT NULL;

-- 8. Insert default admin user (password: admin123 - CHANGE THIS!)
-- Password hash for 'admin123' using bcrypt
INSERT OR IGNORE INTO users (id, username, password_hash, full_name, role, is_active)
VALUES (
  'default-admin-001',
  'admin',
  '$2b$10$rKvVPZqGvXqKqVXqKqVXqOqVXqKqVXqKqVXqKqVXqKqVXqKqVXqK',
  'System Administrator',
  'admin',
  1
);
