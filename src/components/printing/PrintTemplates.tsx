import React from 'react';
import { Customer, Invoice, SystemSettings } from '../../types/models';
import './PrintTemplates.css';

interface InvoicePrintProps {
    invoice: Invoice;
    settings: SystemSettings;
}

export const BrandedInvoiceA4 = React.forwardRef<HTMLDivElement, InvoicePrintProps>(
    ({ invoice, settings }, ref) => {
        const business = settings?.businessInfo || {} as any;
        const items = invoice?.items || [];
        const totalQty = items.reduce((sum, item) => sum + (item?.quantity || 0), 0);

        return (
            <div ref={ref} className="print-a4-container bg-white p-6 max-w-[210mm] mx-auto min-h-[297mm] relative" dir="rtl" style={{ fontFamily: "'Cairo', system-ui, -apple-system, sans-serif" }}>
                {/* Header */}
                <header className="flex justify-between items-start border-b border-black pb-6 mb-6">
                    <div className="flex flex-col gap-1">
                        {business.logo && (
                            <img src={business.logo} alt="Logo" className="w-20 h-auto object-contain mb-2" />
                        )}
                        <h1 className="text-2xl font-bold text-black">{business.name || 'بيت ورد'}</h1>
                        <div className="text-xs text-slate-600 space-y-0.5 mt-1">
                            {business.address && <p>{business.address}</p>}
                            {business.phone && <p dir="ltr" className="text-right">Tel: {business.phone}</p>}
                            {business.email && <p>Email: {business.email}</p>}
                        </div>
                    </div>
                    <div className="text-left">
                        <h2 className="text-4xl font-bold text-slate-100 uppercase mb-2">Invoice</h2>
                        <div className="space-y-1">
                            <div className="flex items-center justify-end gap-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">رقم الفاتورة</span>
                                <span className="text-lg font-bold text-black">#{invoice.invoiceNumber}</span>
                            </div>
                            <div className="flex items-center justify-end gap-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">التاريخ</span>
                                <span className="font-bold text-slate-700">
                                    {new Date(invoice.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                                </span>
                            </div>
                            {business.taxId && (
                                <div className="flex items-center justify-end gap-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">الرقم الضريبي</span>
                                    <span className="font-bold text-slate-700">{business.taxId}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Customer Section */}
                {invoice.customerName && (
                    <div className="mb-8 bg-slate-50 border border-slate-100 p-4 rounded-lg">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase mb-2">بيانات العميل</h3>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-lg font-bold text-black">{invoice.customerName}</p>
                                {invoice.notes && <p className="text-xs text-slate-500 mt-1">{invoice.notes}</p>}
                            </div>
                            <div className="text-left">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-white border border-slate-200 text-slate-700">
                                    {invoice.pricingType === 'wholesale' ? 'جملة' : 'قطاعي'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Items Table */}
                <main className="mb-8">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-black">
                                <th className="text-right py-2 text-[10px] font-bold text-black uppercase w-10">#</th>
                                <th className="text-right py-2 text-[10px] font-bold text-black uppercase">الصنف</th>
                                <th className="text-center py-2 text-[10px] font-bold text-black uppercase w-20">الكمية</th>
                                <th className="text-center py-2 text-[10px] font-bold text-black uppercase w-24">السعر</th>
                                <th className="text-left py-2 text-[10px] font-bold text-black uppercase w-24">الإجمالي</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {items.map((item, index) => (
                                <tr key={item?.id || index}>
                                    <td className="py-2 text-xs font-bold text-slate-400">{index + 1}</td>
                                    <td className="py-2 text-xs font-bold text-black">{item?.productName || '---'}</td>
                                    <td className="py-2 text-xs font-bold text-slate-700 text-center">{item?.quantity || 0}</td>
                                    <td className="py-2 text-xs font-medium text-slate-500 text-center">{(item?.unitPrice || 0).toFixed(2)}</td>
                                    <td className="py-2 text-xs font-bold text-black text-left">{(item?.totalPrice || 0).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </main>

                {/* Footer & Totals */}
                <footer className="mt-auto">
                    <div className="flex justify-end mb-8">
                        <div className="w-64 space-y-2">
                            <div className="flex justify-between items-center py-1 border-b border-slate-100">
                                <span className="text-xs font-bold text-slate-500">إجمالي الكميات</span>
                                <span className="text-xs font-bold text-black">{totalQty}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-t border-black">
                                <span className="text-base font-bold text-black">المجموع الكلي</span>
                                <span className="text-xl font-bold text-black">{(invoice?.totalAmount || 0).toFixed(2)} <span className="text-xs font-bold text-slate-400">ج.م</span></span>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-6 flex justify-between items-end">
                        <div className="space-y-1">
                            <p className="text-sm font-bold text-black">{business.thankYouNote || 'شكراً لتعاملكم معنا!'}</p>
                            <p className="text-[10px] text-slate-500 font-bold whitespace-pre-line">
                                {business.returnPolicy || 'سياسة الاسترجاع: لا يوجد استرجاع - يوجد استبدال بوجود الفاتوره خلال 3 أيام'}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="h-6 opacity-20 font-mono text-[10px] tracking-widest">{invoice.invoiceNumber}</div>
                        </div>
                    </div>
                </footer>
            </div>
        );
    }
);

interface CustomerListProps {
    customers: Customer[];
    settings: SystemSettings;
    title?: string;
}

export const CustomerListReport = React.forwardRef<HTMLDivElement, CustomerListProps>(
    ({ customers, settings, title = 'تقرير قائمة العملاء' }, ref) => {
        const business = settings.businessInfo;

        return (
            <div ref={ref} className="print-a4-container" dir="rtl">
                <header className="print-header">
                    <div className="business-info">
                        <h1 className="business-name">{business.name || 'بيت ورد'}</h1>
                        <p>{business.address || ''}</p>
                        <p>هاتف: {business.phone || '-'}</p>
                        {business.email && <p>بريد: {business.email}</p>}
                    </div>
                    <div className="invoice-meta">
                        <h2 className="document-title">{title}</h2>
                        <div className="meta-grid">
                            <span>تاريخ التقرير:</span>
                            <span>{new Date().toLocaleDateString('ar-EG', { dateStyle: 'long' })}</span>
                        </div>
                    </div>
                </header>

                <main className="items-section">
                    <table className="print-table">
                        <thead>
                            <tr>
                                <th className="col-id">#</th>
                                <th className="col-name">اسم العميل</th>
                                <th className="col-phone">رقم الهاتف</th>
                                <th className="col-address">العنوان</th>
                                <th className="col-total">إجمالي المشتريات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers && customers.length > 0 ? customers.map((customer, index) => (
                                <tr key={customer?.id || index}>
                                    <td className="col-id">{index + 1}</td>
                                    <td className="col-name">{customer?.name || '---'}</td>
                                    <td className="col-phone">{customer?.phone || '-'}</td>
                                    <td className="col-address">{customer?.address || '-'}</td>
                                    <td className="col-total">{(customer?.totalPurchases || 0).toLocaleString('ar-EG')} ج.م</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="p-10 text-center text-slate-400 font-bold">لا توجد بيانات متاحة</td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan={4} className="text-right font-bold" style={{ padding: '20px 0' }}>إجمالي عدد العملاء في التقرير</td>
                                <td className="total-amount text-center">{customers.length}</td>
                            </tr>
                        </tfoot>
                    </table>
                </main>

                <footer className="print-footer" style={{ marginTop: '50px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                    <div className="footer-notes">
                        <p>تم استخراج هذا التقرير تلقائياً من نظام JOECASHIER</p>
                    </div>
                    <div className="report-time">
                        <p>{new Date().toLocaleTimeString('ar-EG')}</p>
                    </div>
                </footer>
            </div>
        );
    }
);

interface CustomerHistoryProps {
    customer: Customer;
    invoices: Invoice[];
    settings: SystemSettings;
}

export const CustomerHistoryReport = React.forwardRef<HTMLDivElement, CustomerHistoryProps>(
    ({ customer, invoices, settings }, ref) => {
        const business = settings.businessInfo;
        const totalAmount = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

        return (
            <div ref={ref} className="print-a4-container" dir="rtl">
                <header className="print-header">
                    <div className="business-info">
                        <h1 className="business-name">{business.name || 'بيت ورد'}</h1>
                        <p>{business.address}</p>
                        <p>هاتف: {business.phone}</p>
                        {business.email && <p>بريد: {business.email}</p>}
                    </div>
                    <div className="invoice-meta">
                        <h2 className="document-title">سجل مشتريات عميل</h2>
                        <p>تاريخ التقرير: {new Date().toLocaleDateString('ar-EG')}</p>
                    </div>
                </header>

                <div className="customer-section">
                    <h3>بيانات العميل</h3>
                    <div className="customer-info-box">
                        <p><strong>الاسم:</strong> {customer.name}</p>
                        <p><strong>الهاتف:</strong> {customer.phone || '-'}</p>
                        <p><strong>العنوان:</strong> {customer.address || '-'}</p>
                    </div>
                </div>

                <main className="items-section">
                    <table className="print-table">
                        <thead>
                            <tr>
                                <th className="col-id">#</th>
                                <th className="col-qty">رقم الفاتورة</th>
                                <th className="col-phone">التاريخ</th>
                                <th className="col-name">النوع</th>
                                <th className="col-address">طريقة الدفع</th>
                                <th className="col-total">الإجمالي</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map((invoice, index) => (
                                <tr key={invoice.id}>
                                    <td className="col-id">{index + 1}</td>
                                    <td className="col-qty font-bold">#{invoice.invoiceNumber}</td>
                                    <td className="col-phone">{new Date(invoice.createdAt).toLocaleDateString('ar-EG')}</td>
                                    <td className="col-name">{invoice.pricingType === 'wholesale' ? 'جملة' : 'قطاعي'}</td>
                                    <td className="col-address">{invoice.paymentMethod || 'نقدي'}</td>
                                    <td className="col-total">{(invoice.totalAmount || 0).toLocaleString('ar-EG')} ج.م</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan={5} className="text-right font-bold">إجمالي المشتريات</td>
                                <td className="total-amount">{totalAmount.toLocaleString('ar-EG')} ج.م</td>
                            </tr>
                        </tfoot>
                    </table>
                </main>
            </div>
        );
    }
);
