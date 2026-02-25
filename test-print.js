const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

app.whenReady().then(async () => {
    const win = new BrowserWindow({
        show: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    const testFile = path.join(__dirname, 'temp_print_verify.html');
    console.log(`Loading: ${testFile}`);
    await win.loadFile(testFile);

    try {
        const pdfData = await win.webContents.printToPDF({
            printBackground: true,
            landscape: false, // We want to verify portrait
            pageSize: 'A4'
        });

        fs.writeFileSync(path.join(__dirname, 'test_invoice_electron.pdf'), pdfData);
        console.log('SUCCESS: PDF Generated');
    } catch (error) {
        console.error('FAILED:', error);
    }

    app.quit();
});
