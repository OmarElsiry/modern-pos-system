const path = require('path');
console.log('CWD:', process.cwd());
console.log('Expected DB Path:', path.join(process.cwd(), 'pos-database.db'));
