const Database = require('better-sqlite3');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.join(__dirname, 'pos-database.db');
const db = new Database(dbPath);

console.log('Seeding 10,000 products for performance testing...');

const insert = db.prepare(`
  INSERT INTO products (id, name, barcode, categoryId, wholesalePrice, retailPrice, stockQuantity, minStockLevel, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// Get a valid categoryId
const category = db.prepare('SELECT id FROM categories LIMIT 1').get();
const categoryId = category ? category.id : uuidv4();

if (!category) {
    db.prepare('INSERT INTO categories (id, name, createdAt, updatedAt) VALUES (?, ?, ?, ?)').run(
        categoryId, 'Test Category', new Date().toISOString(), new Date().toISOString()
    );
}

const startTime = Date.now();

const insertMany = db.transaction((products) => {
    for (const p of products) insert.run(p);
});

const productsToInsert = [];
for (let i = 0; i < 10000; i++) {
    const now = new Date().toISOString();
    productsToInsert.push([
        uuidv4(),
        `Product Performance Test ${i}`,
        `PERF${i.toString().padStart(6, '0')}`,
        categoryId,
        Math.random() * 100 + 10,
        Math.random() * 200 + 150,
        Math.floor(Math.random() * 1000),
        10,
        now,
        now
    ]);

    if (productsToInsert.length === 1000) {
        insertMany(productsToInsert);
        productsToInsert.length = 0;
        console.log(`Inserted ${i + 1} products...`);
    }
}

if (productsToInsert.length > 0) {
    insertMany(productsToInsert);
}

const endTime = Date.now();
console.log(`Finished seeding 10,000 products in ${(endTime - startTime) / 1000}s`);
db.close();
