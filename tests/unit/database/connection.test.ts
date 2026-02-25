import { initializeDatabase, getDatabase, closeDatabase } from '../../../src/database/connection';
import * as fs from 'fs';
import * as path from 'path';

describe('Database Connection', () => {
  const testDbPath = path.join(process.cwd(), 'test-database.db');

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

  it('should initialize database successfully', () => {
    const db = initializeDatabase(testDbPath);
    expect(db).toBeDefined();
    expect(fs.existsSync(testDbPath)).toBe(true);
  });

  it('should create all required tables', () => {
    initializeDatabase(testDbPath);
    const db = getDatabase();

    // Check if tables exist
    const tables = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      ORDER BY name
    `).all();

    const tableNames = tables.map((t: any) => t.name);
    expect(tableNames).toContain('categories');
    expect(tableNames).toContain('products');
    expect(tableNames).toContain('invoices');
    expect(tableNames).toContain('invoice_items');
  });

  it('should throw error when getting database before initialization', () => {
    expect(() => getDatabase()).toThrow('Database not initialized');
  });

  it('should enable WAL mode for performance', () => {
    initializeDatabase(testDbPath);
    const db = getDatabase();

    const result = db.pragma('journal_mode', { simple: true });
    expect(result).toBe('wal');
  });
});
