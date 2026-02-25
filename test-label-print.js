const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

// Mock data
const barcodeSvg = `<svg id="barcode"></svg>`; // We'll inject a simple SVG for testing

const htmlContent = `
<!DOCTYPE html>
<html dir="rtl">
<head>
<style>
    @page {
    size: 38mm 25mm;
    margin: 2mm;
    }
    body {
    margin: 0;
    padding: 0;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    width: 38mm;
    background: white;
    }
    .label {
    width: 34mm; /* 38 - 4mm margins */
    height: 21mm; /* 25 - 4mm margins */
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    box-sizing: border-box;
    background: white;
    padding: 1mm;
    border: 1px dashed #ccc; /* Visual aid for PDF */
    }
    .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    width: 100%;
    height: 100%;
    /* ROTATION SIMULATION */
    transform: rotate(90deg); 
    transform-origin: center;
    }
    .product-name { font-size: 10px; font-weight: 900; }
    .price { font-size: 12px; font-weight: 900; }
    .barcode-container { margin: 2px 0; border: 1px solid black; width: 80%; height: 10px; } 
</style>
</head>
<body>
    <div class="label">
        <div class="content">
            <div class="product-name">منتج تجريبي</div>
            <div class="barcode-container">||||||||||</div>
            <div class="price">150.00 ج.م</div>
        </div>
    </div>
</body>
</html>
`;

app.whenReady().then(async () => {
    const win = new BrowserWindow({ show: false });

    await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);

    try {
        const pdfData = await win.webContents.printToPDF({
            printBackground: true,
            margins: { marginType: 'none' },
            pageSize: { width: 38000, height: 25000 } // Micron? No, Electron uses different units sometimes, but 'size' in CSS usually wins. Let's try explicit.
            // Actually for thermal, letting CSS @page handle it is best, but printToPDF needs help.
        });

        fs.writeFileSync(path.join(__dirname, 'test_label_rotated.pdf'), pdfData);
        console.log('SUCCESS: Label PDF Generated');
    } catch (error) {
        console.error('FAILED:', error);
    }

    app.quit();
});
