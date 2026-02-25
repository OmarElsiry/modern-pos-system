const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'pos-database.db');
const db = new Database(dbPath);

console.log('--- Table Info: products ---');
const tableInfo = db.prepare('PRAGMA table_info(products)').all();
console.log(JSON.stringify(tableInfo, null, 2));

console.log('\n--- First 5 products ---');
const products = db.prepare('SELECT * FROM products LIMIT 5').all();
console.log(JSON.stringify(products, null, 2));

db.close();
