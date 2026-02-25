import { ProductService } from './ProductService';
import { CustomerService } from './CustomerService';
import { ReportService } from './ReportService';
import { SettingsService } from './SettingsService';
import { BusinessInfo } from '../types/models';

export class ReportPDFService {
  private static productService = new ProductService();
  private static customerService = new CustomerService();
  private static reportService = new ReportService();
  private static settingsService = new SettingsService();

  private static async getBusinessInfo(): Promise<BusinessInfo | undefined> {
    const settings = await this.settingsService.getSettings();
    return settings.data?.businessInfo;
  }

  private static getBaseStyle(): string {
    return `
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
                body { font-family: 'Cairo', sans-serif; direction: rtl; padding: 20px; color: #1e293b; }
                h1 { color: #0f172a; text-align: center; margin-bottom: 20px; font-size: 24px; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
                .meta { color: #64748b; font-size: 14px; margin-bottom: 5px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th { background-color: #f1f5f9; color: #334155; font-weight: 700; padding: 12px; text-align: right; border: 1px solid #e2e8f0; }
                td { padding: 12px; border: 1px solid #e2e8f0; }
                tr:nth-child(even) { background-color: #f8fafc; }
                .summary-card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
                .summary-title { color: #64748b; font-size: 14px; margin-bottom: 5px; }
                .summary-value { color: #0f172a; font-size: 20px; font-weight: 700; }
                @media print {
                    button { display: none; }
                    body { padding: 0; }
                }
            </style>
        `;
  }

  /**
   * Generates HTML for the Sales Report (Current Month)
   */
  static async generateSalesReportHTML(): Promise<string> {
    const end = new Date();
    const start = new Date();
    start.setDate(1); // Start of current month

    const summary = await this.reportService.getSalesSummary(start, end);
    const businessInfo = await this.getBusinessInfo();

    return `
            <!DOCTYPE html>
            <html dir="rtl">
            <head>
                <meta charset="UTF-8">
                <title>Invoices</title>
                ${this.getBaseStyle()}
            </head>
            <body>
                <div class="header">
                    <h1>${businessInfo?.name || 'نقطة بيع'}</h1>
                    <div class="meta">${businessInfo?.address || ''}</div>
                    <div class="meta">${businessInfo?.phone || ''}</div>
                    <h2>تقرير المبيعات الشهري</h2>
                    <div class="meta">الفترة: ${start.toLocaleDateString('ar-EG')} - ${end.toLocaleDateString('ar-EG')}</div>
                </div>

                <div class="summary-card">
                    <div style="display: flex; justify-content: space-between; gap: 20px;">
                        <div>
                            <div class="summary-title">إجمالي المبيعات</div>
                            <div class="summary-value">${summary.totalSales.toLocaleString()} ج.م</div>
                        </div>
                        <div>
                            <div class="summary-title">عدد الفواتير</div>
                            <div class="summary-value">${summary.totalInvoices}</div>
                        </div>
                        <div>
                            <div class="summary-title">متوسط الفاتورة</div>
                            <div class="summary-value">${summary.averageInvoiceValue.toLocaleString()} ج.م</div>
                        </div>
                    </div>
                </div>

                <div style="text-align: center; margin-top: 40px; color: #94a3b8; font-size: 12px;">
                    تم استخراج هذا التقرير آلياً من النظام بتاريخ ${new Date().toLocaleString('ar-EG')}
                </div>
            </body>
            </html>
        `;
  }

  /**
   * Generates HTML for the Inventory Report
   */
  static async generateInventoryReportHTML(): Promise<string> {
    const response = await this.productService.getAllProducts();
    const products = response.success ? response.data : [];
    const businessInfo = await this.getBusinessInfo();

    const totalValue = products.reduce((sum, p) => sum + (p.purchasePrice * p.stockQuantity), 0);
    const totalItems = products.reduce((sum, p) => sum + p.stockQuantity, 0);

    return `
            <!DOCTYPE html>
            <html dir="rtl">
            <head>
                <meta charset="UTF-8">
                <title>Inventory</title>
                ${this.getBaseStyle()}
            </head>
            <body>
                <div class="header">
                    <h1>${businessInfo?.name || 'نقطة بيع'}</h1>
                    <h2>تقرير المخزون</h2>
                </div>

                <div class="summary-card">
                    <div style="display: flex; gap: 40px;">
                        <div>
                            <div class="summary-title">إجمالي قيمة المخزون (شراء)</div>
                            <div class="summary-value">${totalValue.toLocaleString()} ج.م</div>
                        </div>
                        <div>
                            <div class="summary-title">إجمالي عدد القطع</div>
                            <div class="summary-value">${totalItems.toLocaleString()}</div>
                        </div>
                        <div>
                            <div class="summary-title">عدد الأصناف</div>
                            <div class="summary-value">${products.length}</div>
                        </div>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>المنتج</th>
                            <th>الباركود</th>
                            <th>سعر الشراء</th>
                            <th>سعر البيع</th>
                            <th>الكمية</th>
                            <th>القيمة الإجمالية</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${products.map(p => `
                            <tr>
                                <td>${p.name}</td>
                                <td>${p.barcode}</td>
                                <td>${p.purchasePrice}</td>
                                <td>${p.retailPrice}</td>
                                <td>${p.stockQuantity}</td>
                                <td>${(p.purchasePrice * p.stockQuantity).toLocaleString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `;
  }

  /**
   * Generates HTML for the Customer List
   */
  static async generateCustomerListHTML(): Promise<string> {
    const response = await this.customerService.getAllCustomers();
    const customers = response.success ? response.data : [];
    const businessInfo = await this.getBusinessInfo();

    return `
             <!DOCTYPE html>
            <html dir="rtl">
            <head>
                <meta charset="UTF-8">
                <title>Customers</title>
                ${this.getBaseStyle()}
            </head>
            <body>
                <div class="header">
                    <h1>${businessInfo?.name || 'نقطة بيع'}</h1>
                    <h2>قائمة العملاء</h2>
                </div>

                <div class="summary-card">
                    <div>
                        <div class="summary-title">إجمالي العملاء</div>
                        <div class="summary-value">${customers.length}</div>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>اسم العميل</th>
                            <th>رقم الهاتف</th>
                            <th>العنوان</th>
                            <th>ملاحظات</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${customers.map(c => `
                            <tr>
                                <td>${c.name}</td>
                                <td>${c.phone}</td>
                                <td>${c.address || '-'}</td>
                                <td>${c.notes || '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `;
  }

  /**
   * Triggers the browser print dialog for the generated HTML
   */
  static async generatePDF(html: string, _filename: string): Promise<void> {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      // Give time for styles/fonts to load
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    } else {
      console.error('Print window blocked');
      alert('Please allow popups for printing');
    }
  }
}
