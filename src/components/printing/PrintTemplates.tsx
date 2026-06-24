import React from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import { Customer, Invoice, SystemSettings } from '../../types/models';
import './PrintTemplates.css';

const getLocale = (lang: string): string => {
    const map: Record<string, string> = { ar: 'ar-EG', fa: 'fa-IR', de: 'de-DE', fr: 'fr-FR', ru: 'ru-RU', zh: 'zh-CN', en: 'en-US' };
    return map[lang] || 'en-US';
};

interface InvoicePrintProps {
    invoice: Invoice;
    settings: SystemSettings;
}

export const BrandedInvoiceA4 = React.forwardRef<HTMLDivElement, InvoicePrintProps>(
    ({ invoice, settings }, ref) => {
        const { t } = useTranslation();
        const business = settings?.businessInfo || {} as any;
        const items = invoice?.items || [];
        const totalQty = items.reduce((sum, item) => sum + (item?.quantity || 0), 0);
        const locale = getLocale(i18n.language);

        return (
            <div ref={ref} className="print-a4-container bg-white p-6 max-w-[210mm] mx-auto min-h-[297mm] relative" dir="rtl" style={{ fontFamily: "'Cairo', system-ui, -apple-system, sans-serif" }}>
                {/* Header */}
                <header className="flex justify-between items-start border-b border-black pb-6 mb-6">
                    <div className="flex flex-col gap-1">
                        {business.logo && (
                            <img src={business.logo} alt="Logo" className="w-20 h-auto object-contain mb-2" />
                        )}
                        <h1 className="text-2xl font-bold text-black">{business.name || t('settings.storeName')}</h1>
                        <div className="text-xs text-slate-600 space-y-0.5 mt-1">
                            {business.address && <p>{business.address}</p>}
                            {business.phone && <p dir="ltr" className="text-right">Tel: {business.phone}</p>}
                            {business.email && <p>Email: {business.email}</p>}
                        </div>
                    </div>
                    <div className="text-left">
                        <h2 className="text-4xl font-bold text-slate-100 uppercase mb-2">{t('invoices.saleInvoice')}</h2>
                        <div className="space-y-1">
                            <div className="flex items-center justify-end gap-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">{t('invoices.invoiceNumber')}</span>
                                <span className="text-lg font-bold text-black">#{invoice.invoiceNumber}</span>
                            </div>
                            <div className="flex items-center justify-end gap-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">{t('invoices.dateTime')}</span>
                                <span className="font-bold text-slate-700">
                                    {new Date(invoice.createdAt).toLocaleDateString(locale, { year: 'numeric', month: '2-digit', day: '2-digit' })}
                                </span>
                            </div>
                            {business.taxId && (
                                <div className="flex items-center justify-end gap-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">{t('settings.taxId')}</span>
                                    <span className="font-bold text-slate-700">{business.taxId}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Customer Section */}
                {invoice.customerName && (
                    <div className="mb-8 bg-slate-50 border border-slate-100 p-4 rounded-lg">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase mb-2">{t('invoices.customerLabel')}</h3>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-lg font-bold text-black">{invoice.customerName}</p>
                                {invoice.notes && <p className="text-xs text-slate-500 mt-1">{invoice.notes}</p>}
                            </div>
                            <div className="text-left">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-white border border-slate-200 text-slate-700">
                                    {invoice.pricingType === 'wholesale' ? (settings?.pricingOpts?.tier2Name || t('pos.tier2Default')) : invoice.pricingType === 'retail' ? (settings?.pricingOpts?.tier1Name || t('pos.tier1Default')) : (settings?.pricingOpts?.customTiers?.find(t => t.id === invoice.pricingType)?.name || t('common.custom'))}
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
                                <th className="text-right py-2 text-[10px] font-bold text-black uppercase">{t('receiptPreview.item')}</th>
                                <th className="text-center py-2 text-[10px] font-bold text-black uppercase w-20">{t('receiptPreview.quantity')}</th>
                                <th className="text-center py-2 text-[10px] font-bold text-black uppercase w-24">{t('receiptPreview.price')}</th>
                                <th className="text-left py-2 text-[10px] font-bold text-black uppercase w-24">{t('receiptPreview.total')}</th>
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
                                <span className="text-xs font-bold text-slate-500">{t('invoices.items')}</span>
                                <span className="text-xs font-bold text-black">{totalQty}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-t border-black">
                                <span className="text-base font-bold text-black">{t('invoices.invoiceTotal')}</span>
                                <span className="text-xl font-bold text-black">{(invoice?.totalAmount || 0).toFixed(2)} <span className="text-xs font-bold text-slate-400">{t('pos.currencySymbol')}</span></span>
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
    ({ customers, settings, title }, ref) => {
        const { t } = useTranslation();
        const business = settings.businessInfo;
        const reportTitle = title || t('customers.pdfTitle');
        const locale = getLocale(i18n.language);

        return (
            <div ref={ref} className="print-a4-container" dir="rtl">
                <header className="print-header">
                    <div className="business-info">
                        <h1 className="business-name">{business.name || t('settings.storeName')}</h1>
                        <p>{business.address || ''}</p>
                        <p>{t('settings.phoneLabel')}: {business.phone || '-'}</p>
                        {business.email && <p>{t('settings.email')}: {business.email}</p>}
                    </div>
                    <div className="invoice-meta">
                        <h2 className="document-title">{reportTitle}</h2>
                        <div className="meta-grid">
                            <span>{t('reports.reportDate')}:</span>
                            <span>{new Date().toLocaleDateString(locale, { dateStyle: 'long' })}</span>
                        </div>
                    </div>
                </header>

                <main className="items-section">
                    <table className="print-table">
                        <thead>
                            <tr>
                                <th className="col-id">#</th>
                                <th className="col-name">{t('customers.customer')}</th>
                                <th className="col-phone">{t('customers.phone')}</th>
                                <th className="col-address">{t('customers.addressLabel')}</th>
                                <th className="col-total">{t('customers.totalPurchases')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers && customers.length > 0 ? customers.map((customer, index) => (
                                <tr key={customer?.id || index}>
                                    <td className="col-id">{index + 1}</td>
                                    <td className="col-name">{customer?.name || '---'}</td>
                                    <td className="col-phone">{customer?.phone || '-'}</td>
                                    <td className="col-address">{customer?.address || '-'}</td>
                                     <td className="col-total">{(customer?.totalPurchases || 0).toLocaleString(locale)} {t('pos.currencySymbol')}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="p-10 text-center text-slate-400 font-bold">{t('common.noData')}</td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan={4} className="text-right font-bold" style={{ padding: '20px 0' }}>{t('common.total')}</td>
                                <td className="total-amount text-center">{customers.length}</td>
                            </tr>
                        </tfoot>
                    </table>
                </main>

                <footer className="print-footer" style={{ marginTop: '50px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                    <div className="footer-notes">
                        <p>{t('customers.autoGeneratedReport')}</p>
                    </div>
                    <div className="report-time">
                        <p>{new Date().toLocaleTimeString(locale)}</p>
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
        const { t } = useTranslation();
        const business = settings.businessInfo;
        const totalAmount = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
        const locale = getLocale(i18n.language);

        return (
            <div ref={ref} className="print-a4-container" dir="rtl">
                <header className="print-header">
                    <div className="business-info">
                        <h1 className="business-name">{business.name || t('settings.storeName')}</h1>
                        <p>{business.address}</p>
                        <p>{t('settings.phoneLabel')}: {business.phone}</p>
                        {business.email && <p>{t('settings.email')}: {business.email}</p>}
                    </div>
                    <div className="invoice-meta">
                        <h2 className="document-title">{t('customers.pdfHistoryTitle')}</h2>
                        <p>{t('reports.reportDate')}: {new Date().toLocaleDateString(locale)}</p>
                    </div>
                </header>

                <div className="customer-section">
                    <h3>{t('invoices.customerLabel')}</h3>
                    <div className="customer-info-box">
                        <p><strong>{t('customers.fullName')}:</strong> {customer.name}</p>
                        <p><strong>{t('customers.phone')}:</strong> {customer.phone || '-'}</p>
                        <p><strong>{t('customers.addressLabel')}:</strong> {customer.address || '-'}</p>
                    </div>
                </div>

                <main className="items-section">
                    <table className="print-table">
                        <thead>
                            <tr>
                                <th className="col-id">#</th>
                                <th className="col-qty">{t('invoices.invoiceNumber')}</th>
                                <th className="col-phone">{t('invoices.dateTime')}</th>
                                <th className="col-name">{t('invoices.pricingType')}</th>
                                <th className="col-address">{t('invoices.paymentMethod')}</th>
                                <th className="col-total">{t('common.total')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map((invoice, index) => (
                                <tr key={invoice.id}>
                                    <td className="col-id">{index + 1}</td>
                                    <td className="col-qty font-bold">#{invoice.invoiceNumber}</td>
                                     <td className="col-phone">{new Date(invoice.createdAt).toLocaleDateString(locale)}</td>
                                    <td className="col-name">{invoice.pricingType === 'wholesale' ? (settings?.pricingOpts?.tier2Name || t('pos.tier2Default')) : invoice.pricingType === 'retail' ? (settings?.pricingOpts?.tier1Name || t('pos.tier1Default')) : (settings?.pricingOpts?.customTiers?.find(t => t.id === invoice.pricingType)?.name || t('common.custom'))}</td>
                                    <td className="col-address">{invoice.paymentMethod || t('pos.cash')}</td>
                                    <td className="col-total">{(invoice.totalAmount || 0).toLocaleString('ar-EG')} {t('pos.currencySymbol')}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan={5} className="text-right font-bold">{t('customers.totalPurchases')}</td>
                                 <td className="total-amount">{totalAmount.toLocaleString(locale)} {t('pos.currencySymbol')}</td>
                            </tr>
                        </tfoot>
                    </table>
                </main>
            </div>
        );
    }
);
