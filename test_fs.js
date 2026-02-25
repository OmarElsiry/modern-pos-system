const fs = require('fs');
const path = require('path');

const p = 'C:\\Users\\PotterParker\\Desktop\\JOECASHIER';
console.log('Files in', p);
fs.readdirSync(p).forEach(f => {
    if (f.toLowerCase().includes('pos-database')) {
        console.log('FOUND:', f);
    }
});
