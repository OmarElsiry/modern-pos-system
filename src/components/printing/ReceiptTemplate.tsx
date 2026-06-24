import { forwardRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Invoice, InvoiceItem } from '../../types/models';
import './ReceiptTemplate.css';

interface ReceiptTemplateProps {
    invoice: Invoice;
    storeName?: string;
    storeAddress?: string;
    storePhone?: string;
}

export const ReceiptTemplate = forwardRef<HTMLDivElement, ReceiptTemplateProps>(
    ({ invoice, storeName, storeAddress, storePhone }, ref) => {
        const { t } = useTranslation();
        const [settings, setSettings] = useState<{ name: string; address?: string; phone?: string } | null>(null);

        useEffect(() => {
            const loadSettings = async () => {
                const response = await (window as any).electronAPI.settings.get();
                if (response.success && response.data) {
                    setSettings(response.data.businessInfo);
                }
            };
            loadSettings();
        }, []);

        const name = settings?.name || storeName || t('layout.sidebarTitle');
        const address = settings?.address || storeAddress || '';
        const phone = settings?.phone || storePhone || '';

        return (
            <div ref={ref} className="receipt-container" dir="rtl">
                <div className="receipt-header">
                    <h2 className="receipt-store-name">{name}</h2>
                    {address && <p>{address}</p>}
                    {phone && <p>{t('layout.sidebarTitle')}: {phone}</p>}
                    <div className="divider"></div>
                    <p>{t('invoices.invoiceNumber')}: {invoice.invoiceNumber}</p>
                    <p>{t('invoices.dateTime')}: {new Date(invoice.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="receipt-body">
                    <table className="receipt-table">
                        <thead>
                            <tr>
                                <th>{t('receiptPreview.item')}</th>
                                <th>{t('receiptPreview.quantity')}</th>
                                <th>{t('receiptPreview.price')}</th>
                                <th>{t('receiptPreview.total')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.items.map((item: InvoiceItem) => (
                                <tr key={item.id}>
                                    <td className="item-name">{item.productName}</td>
                                    <td>{item.quantity}</td>
                                    <td>{item.unitPrice.toFixed(2)}</td>
                                    <td>{item.totalPrice.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="divider"></div>
                </div>

                <div className="receipt-footer">
                    <div className="total-row">
                        <span>{t('receiptPreview.grandTotal')}:</span>
                        <span>{invoice.totalAmount.toFixed(2)} {t('common.currencySymbol')}</span>
                    </div>
                    {invoice.customerName && (
                        <p>{t('invoices.customerLabel')}: {invoice.customerName}</p>
                    )}
                    <div className="divider"></div>
                    <p className="thank-you">{t('settings.thankYouNotePlaceholder')}</p>
                    <p className="barcode">*{invoice.invoiceNumber}*</p>
                </div>
            </div>
        );
    }
);
