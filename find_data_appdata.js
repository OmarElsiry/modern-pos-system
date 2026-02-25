const fs = require('fs');
const path = require('path');
const os = require('os');

function findDb(dir) {
    try {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            try {
                const stats = fs.statSync(fullPath);
                if (stats.isDirectory()) {
                    if (!file.startsWith('.') && !file.includes('Local\\Temp')) {
                        findDb(fullPath);
                    }
                } else if (stats.size > 10000) { // Only check files > 10KB
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

const roaming = path.join(os.homedir(), 'AppData', 'Roaming');
console.log('Searching in', roaming);
findDb(roaming);
