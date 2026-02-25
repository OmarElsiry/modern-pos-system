import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), 'pos-database.db');
console.log('Opening DB at:', dbPath);

try {
    const db = new Database(dbPath, { readonly: true });

    console.log('\n--- Recent Invoices ---');
    const recent = db.prepare('SELECT id, invoice_number, total_amount, status, created_at FROM invoices ORDER BY created_at DESC LIMIT 10').all();
    console.table(recent);

    console.log('\n--- Status Counts ---');
    const counts = db.prepare('SELECT status, COUNT(*) as count, SUM(total_amount) as total FROM invoices GROUP BY status').all();
    console.table(counts);

    console.log('\n--- Revenue Checks ---');
    const completed = db.prepare("SELECT COALESCE(SUM(total_amount), 0) as total FROM invoices WHERE status = 'completed' OR status IS NULL").get() as { total: number };
    const refunded = db.prepare("SELECT COALESCE(SUM(total_amount), 0) as total FROM invoices WHERE status = 'refunded'").get() as { total: number };
    const all = db.prepare("SELECT COALESCE(SUM(total_amount), 0) as total FROM invoices").get() as { total: number };

    console.log('Total Revenue (Completed + NULL):', completed.total);
    console.log('Refunded Total:', refunded.total);
    console.log('Gross Total (All):', all.total);

    db.close();
} catch (error) {
    console.error('Error:', error);
}
