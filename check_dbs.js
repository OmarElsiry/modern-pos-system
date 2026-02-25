const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPaths = [
    'pos-database.db',
    'release/win-unpacked/pos-database.db',
    'release/portable/نظام الكاشير-win32-x64/pos-database.db',
    'release/portable/نظام الكاشير-win32-x64/resources/app/pos-database.db'
];

dbPaths.forEach(dbPath => {
    const fullPath = path.resolve(__dirname, dbPath);
    if (fs.existsSync(fullPath)) {
        try {
            const db = new Database(fullPath);
            const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
            const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get().count;
            console.log(`DB: ${dbPath}`);
            console.log(`Path: ${fullPath}`);
            console.log(`Size: ${fs.statSync(fullPath).size} bytes`);
            console.log(`Products: ${productCount}`);
            console.log(`Categories: ${categoryCount}`);
            console.log('---');
            db.close();
        } catch (e) {
            console.log(`Error reading ${dbPath}: ${e.message}`);
        }
    } else {
        console.log(`File not found: ${dbPath}`);
    }
});
