

export class ExportService {
    /**
     * Generic function to export an array of objects to Excel
     * @param data Array of objects to export
     * @param fileName Name of the file (without extension)
     * @param sheetName Name of the sheet inside the workbook
     */
    static async exportToExcel<T>(data: T[], fileName: string, sheetName: string = 'Data') {
        try {
            if (!data || data.length === 0) {
                throw new Error('لا توجد بيانات للتصدير');
            }

            // Dynamically import XLSX
            const XLSX = await import('xlsx');

            // Create a new workbook
            const wb = XLSX.utils.book_new();

            // Convert data to worksheet
            const ws = XLSX.utils.json_to_sheet(data);

            // Add worksheet to workbook
            XLSX.utils.book_append_sheet(wb, ws, sheetName);

            // Generate file and trigger download
            // In Electron, this will trigger the standard download behavior
            XLSX.writeFile(wb, `${fileName}.xlsx`);

            return { success: true };
        } catch (error: any) {
            console.error('Excel Export Error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Helper to format products for export
     */
    static formatProductsForExport(products: any[]) {
        return products.map(p => ({
            'اسم المنتج': p.name,
            'الباركود': p.barcode,
            'التصنيف': p.categoryName || '',
            'سعر الجملة': p.wholesalePrice,
            'سعر القطاعي': p.retailPrice,
            'الكمية المتوفرة': p.stockQuantity,
            'حد التنبيه': p.minStockLevel || 0,
            'تاريخ الإضافة': new Date(p.createdAt).toLocaleDateString('ar-EG')
        }));
    }

    /**
     * Helper to format invoices for export
     */
    static formatInvoicesForExport(invoices: any[]) {
        return invoices.map(i => ({
            'رقم الفاتورة': i.invoiceNumber,
            'التاريخ': new Date(i.createdAt).toLocaleDateString('ar-EG'),
            'العميل': i.customerName || 'عميل نقدي',
            'الإجمالي': i.totalAmount,
            'طريقة الدفع': i.paymentMethod === 'cash' ? 'نقدي' : i.paymentMethod === 'card' ? 'فيزا' : 'أخرى',
            'الحالة': i.status === 'completed' ? 'مكتملة' : 'ملغاة',
            'عدد الأصناف': i.itemCount || 0
        }));
    }
}
