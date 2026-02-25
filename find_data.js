const fs = require('fs');
const path = require('path');

function findDb(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        try {
            const stats = fs.statSync(fullPath);
            if (stats.isDirectory()) {
                if (file !== 'node_modules' && file !== '.git') {
                    findDb(fullPath);
                }
            } else if (file.endsWith('.db')) {
                const content = fs.readFileSync(fullPath);
                if (content.includes('JEANS M+')) {
                    console.log('FOUND DATA IN:', fullPath);
                    console.log('Size:', stats.size);
                }
            }
        } catch (e) { }
    }
}

console.log('Searching for "JEANS M+" in .db files...');
findDb('C:\\Users\\PotterParker\\Desktop\\JOECASHIER');
