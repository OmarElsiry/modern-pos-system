const fs = require('fs');
const path = require('path');

function findDb(dir) {
    try {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            try {
                const stats = fs.statSync(fullPath);
                if (stats.isDirectory()) {
                    if (file !== 'node_modules' && file !== '.git' && !fullPath.includes('JOECASHIER\\release')) {
                        findDb(fullPath);
                    }
                } else if (file.endsWith('.db') || file.endsWith('.sqlite')) {
                    const content = fs.readFileSync(fullPath);
                    if (content.toString().includes('JEANS M+')) {
                        console.log('FOUND DATA IN:', fullPath);
                        console.log('Size:', stats.size);
                    }
                }
            } catch (e) { }
        }
    } catch (e) { }
}

console.log('Searching for "JEANS M+" in .db and .sqlite files on Desktop...');
findDb('C:\\Users\\PotterParker\\Desktop');
