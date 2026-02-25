
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'pos-database.db');
console.log('Opening DB at:', dbPath);

const db = new Database(dbPath, { readonly: true });

console.log('\n--- Recent Invoices ---');
const recent = db.prepare('SELECT id, invoice_number, total_amount, status, created_at FROM invoices ORDER BY created_at DESC LIMIT 10').all();
console.table(recent);

console.log('\n--- Status Counts ---');
const counts = db.prepare('SELECT status, COUNT(*) as count, SUM(total_amount) as total FROM invoices GROUP BY status').all();
console.table(counts);

console.log('\n--- Revenue Checks ---');
const completed = db.prepare("SELECT COALESCE(SUM(total_amount), 0) as total FROM invoices WHERE status = 'completed' OR status IS NULL").get();
const refunded = db.prepare("SELECT COALESCE(SUM(total_amount), 0) as total FROM invoices WHERE status = 'refunded'").get();
const all = db.prepare("SELECT COALESCE(SUM(total_amount), 0) as total FROM invoices").get();

console.log('Total Revenue (Completed + NULL):', completed.total);
console.log('Refunded Total:', refunded.total);
console.log('Gross Total (All):', all.total);

console.log('\n--- Net Sales Calculation ---');
console.log('Calculated Net Sales:', completed.total);
