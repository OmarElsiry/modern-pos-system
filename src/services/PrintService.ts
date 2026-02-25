import { Invoice, InvoiceItem, Customer, InvoiceTemplate, InvoiceElement, BusinessInfo } from '../types/models';

export interface PrintOptions {
  showLogo?: boolean;
  showTaxNumber?: boolean;
  showFooter?: boolean;
  footerText?: string;
}

/**
 * PrintService - Modern HTML-based receipt and invoice printing
 * Handles Arabic RTL and high-quality design natively.
 */
export class PrintService {
  private businessInfo: BusinessInfo;
  private defaultOptions: PrintOptions;

  constructor() {
    // Load business info from localStorage or use defaults
    const savedInfo = localStorage.getItem('businessInfo');
    this.businessInfo = savedInfo ? JSON.parse(savedInfo) : {
      name: 'متجر جو كاشير',
      address: 'القاهرة، مصر',
      phone: '01000000000',
      email: '',
      taxId: '',
      showName: true,
      showAddress: true,
      showPhone: true,
      returnPolicy: 'لا يوجد استرجاع - يوجد استبدال بوجود الفاتوره خلال 3 أيام',
      thankYouNote: 'شكراً لزيارتكم!',
      logoPosition: 'top-center'
    };

    this.defaultOptions = {
      showLogo: true,
      showTaxNumber: true,
      showFooter: true,
      footerText: 'شكراً لزيارتكم - نتمنى لكم يوماً سعيداً',
    };
  }

  /**
   * Update business information
   */
  updateBusinessInfo(info: BusinessInfo): void {
    this.businessInfo = info;
    localStorage.setItem('businessInfo', JSON.stringify(info));
  }

  /**
   * Get current business information
   */
  getBusinessInfo(): BusinessInfo {
    return { ...this.businessInfo };
  }

  /**
   * Generate HTML receipt (Modern, RTL-friendly, Premium)
   */
  generateHTMLReceipt(
    invoice: Invoice,
    items: InvoiceItem[],
    customer?: Customer,
    options?: PrintOptions,
    inputBusinessInfo?: BusinessInfo
  ): string {
    const opts = { ...this.defaultOptions, ...options };
    const business = inputBusinessInfo || this.businessInfo;

    const dateStr = new Date(invoice.createdAt).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const timeStr = new Date(invoice.createdAt).toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const itemsHtml = items.map((item, index) => `
      <tr class="${index % 2 === 0 ? 'bg-slate-50' : 'bg-white'}">
        <td class="item-name">${item.productName}</td>
        <td class="item-qty">${item.quantity}</td>
        <td class="item-price">${item.unitPrice.toFixed(2)}</td>
        <td class="item-total">${item.totalPrice.toFixed(2)}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap');
          
          :root {
            --primary: #000000;
            --secondary: #4b5563;
            --border: #e5e7eb;
          }

          body {
            font-family: 'Cairo', system-ui, -apple-system, sans-serif;
            margin: 0;
            padding: 10px;
            color: #000;
            background: white;
            font-size: 13px;
            line-height: 1.4;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .receipt-container {
            width: 76mm;
            margin: 0 auto;
            background: white;
          }

          /* Header Styling */
          .header {
            text-align: center;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px dashed var(--primary);
          }
          
          .business-logo {
            width: 60px;
            height: auto;
            margin-bottom: 8px;
            display: block;
            margin-left: auto;
            margin-right: auto;
          }
          
          .business-name {
            font-size: 20px;
            font-weight: 700;
            margin: 0 0 5px 0;
            color: var(--primary);
          }
          
          .business-info {
            font-size: 11px;
            color: var(--secondary);
            margin: 2px 0;
            font-weight: 400;
          }

          /* Invoice Title & Meta */
          .invoice-type {
            text-align: center;
            margin: 10px 0;
            font-weight: 700;
            text-decoration: underline;
          }

          .meta-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 4px;
            margin-bottom: 15px;
            padding: 5px 0;
            border-bottom: 1px solid var(--border);
          }
          
          .meta-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
          }
          
          .meta-label {
            font-weight: 400;
            color: var(--secondary);
          }
          
          .meta-value {
            font-weight: 700;
          }

          /* Table Styling */
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
          }
          
          .items-table th {
            text-align: start;
            font-size: 11px;
            font-weight: 700;
            border-bottom: 1px solid var(--primary);
            padding: 5px 2px;
          }
          
          .items-table td {
            padding: 8px 2px;
            border-bottom: 1px solid var(--border);
            font-size: 12px;
          }
          
          .item-name { font-weight: 700; width: 45%; }
          .item-qty { text-align: center; width: 15%; }
          .item-price { text-align: end; width: 20%; }
          .item-total { text-align: end; width: 20%; font-weight: 700; }
          
          /* Summary Section */
          .summary-card {
            margin-top: 5px;
          }
          
          .summary-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 4px;
            font-size: 12px;
          }
          
          .summary-total {
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid var(--primary);
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .total-label {
            font-size: 15px;
            font-weight: 700;
          }
          
          .total-amount {
            font-size: 20px;
            font-weight: 700;
          }

          /* Policy Note */
          .policy-note {
            margin-top: 15px;
            text-align: center;
            font-size: 11px;
            font-weight: 700;
            padding: 8px;
            background: #f9fafb;
            border: 1px dashed #d1d5db;
            line-height: 1.6;
          }

          /* Footer */
          .footer {
            margin-top: 25px;
            text-align: center;
          }
          
          .footer-message {
            font-size: 12px;
            font-weight: 700;
            margin-bottom: 5px;
          }
          
          .footer-sub {
            font-size: 10px;
            color: var(--secondary);
          }

          @media print {
            body { padding: 0; background: none; }
            .receipt-container { width: 100%; }
            @page { margin: 0; size: 80mm auto; }
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            ${business.logo ? `<img src="${business.logo}" class="business-logo" />` : ''}
            ${business.showName ? `<h1 class="business-name">${business.name}</h1>` : ''}
            
            <div style="display: flex; flex-direction: column; gap: 2px;">
              ${business.showAddress && business.address ? `<div class="business-info">${business.address}</div>` : ''}
              ${business.showPhone && business.phone ? `<div class="business-info" dir="ltr">${business.phone}</div>` : ''}
              ${business.email ? `<div class="business-info" dir="ltr">${business.email}</div>` : ''}
              ${opts.showTaxNumber && business.taxId ? `<div class="business-info">الرقم الضريبي: ${business.taxId}</div>` : ''}
            </div>
          </div>

          <div class="invoice-type">
            فاتورة مبيعات ${invoice.pricingType === 'wholesale' ? '(جملة)' : ''}
          </div>
          
          <div class="meta-grid">
            <div class="meta-row">
              <span class="meta-label">رقم الفاتورة</span>
              <span class="meta-value">#${invoice.invoiceNumber}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">التاريخ</span>
              <span class="meta-value" dir="ltr">${dateStr}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">الوقت</span>
              <span class="meta-value" dir="ltr">${timeStr}</span>
            </div>
            ${customer ? `
              <div class="meta-row" style="border-top: 1px dashed var(--border); padding-top: 4px; margin-top: 2px;">
                <span class="meta-label">العميل</span>
                <span class="meta-value">${customer.name}</span>
              </div>
            ` : ''}
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>الصنف</th>
                <th style="text-align: center">ك</th>
                <th style="text-align: end">س</th>
                <th style="text-align: end">المجموع</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div class="summary-card">
            <div class="summary-row">
              <span class="meta-label">إجمالي الكميات</span>
              <span class="meta-value">${items.reduce((acc, item) => acc + item.quantity, 0)}</span>
            </div>
            
            <div class="summary-total">
              <span class="total-label">الإجمالي الكلي</span>
              <span class="total-amount">${invoice.totalAmount.toFixed(2)} <span style="font-size: 13px;">ج.م</span></span>
            </div>
          </div>

          <div class="policy-note">
            ${business.returnPolicy || 'لا يوجد استرجاع - يوجد استبدال بوجود الفاتوره خلال 3 أيام'}
          </div>
          
          <div class="footer">
            ${opts.showFooter ? `
              <div class="footer-message">${business.thankYouNote || 'شكراً لزيارتكم!'}</div>
              <div class="footer-sub">نسخة أصلية</div>
            ` : ''}
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Preview receipt (returns blob URL of HTML)
   */
  previewReceipt(
    invoice: Invoice,
    items: InvoiceItem[],
    customer?: Customer,
    options?: PrintOptions,
    template?: InvoiceTemplate,
    businessInfo?: BusinessInfo
  ): string {
    const html = template
      ? this.generateHTMLFromTemplate(template, invoice, items, customer, businessInfo)
      : this.generateHTMLReceipt(invoice, items, customer, options, businessInfo);
    const blob = new Blob([html], { type: 'text/html' });
    return URL.createObjectURL(blob);
  }

  /**
   * Print receipt (opens print dialog)
   */
  printReceipt(
    invoice: Invoice,
    items: InvoiceItem[],
    customer?: Customer,
    options?: PrintOptions,
    template?: InvoiceTemplate,
    businessInfo?: BusinessInfo
  ): void {
    const html = template
      ? this.generateHTMLFromTemplate(template, invoice, items, customer, businessInfo)
      : this.generateHTMLReceipt(invoice, items, customer, options, businessInfo);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      let printed = false;
      const doPrint = () => {
        if (!printed && !printWindow.closed) {
          printed = true;
          printWindow.print();
        }
      };

      printWindow.onload = () => {
        setTimeout(doPrint, 500);
      };

      // Fallback for Blob URLs where onload might not fire as expected
      setTimeout(doPrint, 1500);
    }
  }

  /**
   * Save receipt/invoice as PDF
   */
  async saveAsPDF(
    invoice: Invoice,
    items: InvoiceItem[],
    customer?: Customer,
    options?: PrintOptions,
    template?: InvoiceTemplate,
    businessInfo?: BusinessInfo
  ): Promise<{ success: boolean; cancelled?: boolean; error?: string }> {
    const html = template
      ? this.generateHTMLFromTemplate(template, invoice, items, customer, businessInfo)
      : this.generateHTMLReceipt(invoice, items, customer, options, businessInfo);

    const filename = `Invoice_${invoice.invoiceNumber}.pdf`;

    // In Electron, we want to render this HTML and then print it to PDF
    // We'll use a hidden window via a new IPC handler if available, 
    // or just use the current window approach if we can render it.

    try {
      const api = (window as any).electronAPI;
      if (api?.app?.saveAsPDF) {
        return await api.app.saveAsPDF({
          filename,
          landscape: template?.type === 'A4' ? false : false,
          html: html
        });
      } else {
        // Fallback or non-electron
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(html);
          printWindow.document.close();
          printWindow.print();
          printWindow.close();
          return { success: true };
        }
        return { success: false, error: 'Could not open print window' };
      }
    } catch (err) {
      console.error('PDF save failed:', err);
      return { success: false, error: (err as Error).message };
    }
  }

  /**
   * Alias for printReceipt for backwards compatibility or explicit intent
   */
  async downloadReceipt(
    invoice: Invoice,
    items: InvoiceItem[],
    customer?: Customer,
    options?: PrintOptions,
    template?: InvoiceTemplate,
    businessInfo?: BusinessInfo
  ): Promise<void> {
    await this.saveAsPDF(invoice, items, customer, options, template, businessInfo);
  }

  /**
   * Generate HTML from a custom template
   */
  generateHTMLFromTemplate(
    template: InvoiceTemplate,
    invoice: Invoice,
    items: InvoiceItem[],
    customer?: Customer,
    businessInfo?: BusinessInfo
  ): string {
    const isA4 = template.type === 'A4';
    const containerWidth = isA4 ? '210mm' : '80mm';
    const containerHeight = isA4 ? '297mm' : 'auto';
    const activeBusinessInfo = businessInfo || this.businessInfo;

    const renderElement = (el: InvoiceElement) => {
      if (!el.isVisible) return '';

      const style = `
        position: absolute;
        left: ${el.x}%;
        top: ${el.y}%;
        width: ${el.width ? el.width + '%' : 'auto'};
        height: ${el.height ? el.height + '%' : 'auto'};
        font-size: ${el.fontSize || 12}px;
        font-weight: ${el.fontWeight || 'normal'};
        text-align: ${el.alignment || 'right'};
        ${el.type === 'line' ? 'background-color: black;' : ''}
      `;

      let content = '';
      if (el.type === 'text') {
        content = (el.content || '').replace(/\n/g, '<br/>');
        // Handle special BG block hack from designer
        if (el.id === 'bg-header' && !el.content?.trim()) {
          return `<div style="${style} background: #f8fafc; border-bottom: 2px solid #e2e8f0; z-index: -1;"></div>`;
        }
      } else if (el.type === 'field') {
        if (el.field === 'invoiceNumber') content = invoice.invoiceNumber;
        else if (el.field === 'createdAt') content = new Date(invoice.createdAt).toLocaleDateString('ar-EG');
        else if (el.field === 'totalAmount') content = invoice.totalAmount.toFixed(2) + ' ج.م';
        else if (el.field === 'name') content = activeBusinessInfo.name;
        else if (el.field === 'address') content = activeBusinessInfo.address || '';
        else if (el.field === 'phone') content = activeBusinessInfo.phone || '';
        else if (el.field === 'email') content = activeBusinessInfo.email || '';
        else if (el.field === 'taxId') content = activeBusinessInfo.taxId || '';
        else if (el.field === 'returnPolicy') content = activeBusinessInfo.returnPolicy || '';
        else if (el.field === 'thankYouNote') content = activeBusinessInfo.thankYouNote || '';
        else if (el.field === 'customerName') content = customer?.name || '---';
      } else if (el.type === 'image') {
        content = el.content === 'LOCO_URL' ? `<img src="logo.png" style="width: 100%; height: 100%; object-fit: contain;" />` : '';
      } else if (el.type === 'line') {
        content = '';
      } else if (el.type === 'items_table') {
        const rows = items.map(item => `
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 8px 4px;">${item.productName}</td>
            <td style="padding: 8px 4px; text-align: center;">${item.quantity}</td>
            <td style="padding: 8px 4px; text-align: center;">${item.unitPrice.toFixed(2)}</td>
            <td style="padding: 8px 4px; text-align: left;">${item.totalPrice.toFixed(2)}</td>
          </tr>
        `).join('');

        content = `
          <table style="width: 100%; border-collapse: collapse; font-size: 0.9em;">
            <thead>
              <tr style="border-bottom: 2px solid #0f172a; background: #f8fafc;">
                <th style="padding: 8px 4px; text-align: right;">الصنف</th>
                <th style="padding: 8px 4px; text-align: center;">الكمية</th>
                <th style="padding: 8px 4px; text-align: center;">السعر</th>
                <th style="padding: 8px 4px; text-align: left;">المجموع</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
              ${isA4 ? `
                <tr style="border-top: 2px solid #0f172a;">
                   <td colspan="3" style="padding: 10px 4px; font-weight: bold;">الإجمالي الكلي</td>
                   <td style="padding: 10px 4px; font-weight: bold; text-align: left;">${invoice.totalAmount.toFixed(2)}</td>
                </tr>
              ` : ''}
            </tbody>
          </table>
        `;
      }

      return `<div style="${style}">${content}</div>`;
    };

    const elementsHtml = template.elements.map(renderElement).join('');

    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background: #f1f5f9;
          }
          .page-container {
            width: ${containerWidth};
            min-height: ${isA4 ? containerHeight : 'auto'};
            height: ${isA4 ? 'auto' : 'auto'};
            margin: 0 auto;
            background: white;
            position: relative;
            box-sizing: border-box;
            ${isA4 ? 'padding: 0; box-shadow: 0 0 20px rgba(0,0,0,0.1);' : 'padding: 10px;'}
            /* Ensure height is at least content height for absolute children */
            display: flex;
            flex-direction: column;
          }
          @media print {
            body { background: none; }
            .page-container { box-shadow: none; margin: 0; }
            @page { margin: 0; size: ${isA4 ? 'A4' : '80mm auto'}; }
          }
        </style>
      </head>
      <body>
        <div class="page-container">
          ${elementsHtml}
        </div>
      </body>
      </html>
    `;
  }

  async saveHtmlAsPDF(
    html: string,
    options: { filename?: string; landscape?: boolean } = {}
  ): Promise<{ success: boolean; cancelled?: boolean; error?: string }> {
    try {
      const api = (window as any).electronAPI;
      if (api?.app?.saveAsPDF) {
        return await api.app.saveAsPDF({
          filename: options.filename || 'report.pdf',
          landscape: options.landscape || false,
          html: html // Send HTML for background rendering
        });
      } else {
        // Fallback to basic print if API not available
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(html);
          printWindow.document.close();
          printWindow.print();
          printWindow.close();
          return { success: true };
        }
        return { success: false, error: 'Could not open print window' };
      }
    } catch (error) {
      console.error('PDF save failed:', error);
      return { success: false, error: String(error) };
    }
  }
}

