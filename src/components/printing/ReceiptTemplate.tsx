import { forwardRef, useEffect, useState } from 'react';
import { Invoice, InvoiceItem } from '../../types/models';
import './ReceiptTemplate.css';

interface ReceiptTemplateProps {
    invoice: Invoice;
    storeName?: string;
    storeAddress?: string;
    storePhone?: string;
}

export const ReceiptTemplate = forwardRef<HTMLDivElement, ReceiptTemplateProps>(
    ({ invoice, storeName = 'بيت ورد', storeAddress = '123 Main St, Cairo', storePhone = '01000000000' }, ref) => {
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

        const name = settings?.name || storeName;
        const address = settings?.address || storeAddress;
        const phone = settings?.phone || storePhone;

        return (
            <div ref={ref} className="receipt-container" dir="rtl">
                <div className="receipt-header">
                    <h2 className="receipt-store-name">{name}</h2>
                    <p>{address}</p>
                    <p>هاتف: {phone}</p>
                    <div className="divider"></div>
                    <p>رقم الفاتورة: {invoice.invoiceNumber}</p>
                    <p>التاريخ: {new Date(invoice.createdAt).toLocaleString('ar-EG')}</p>
                </div>

                <div className="receipt-body">
                    <table className="receipt-table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Qty</th>
                                <th>Price</th>
                                <th>Total</th>
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
                        <span>الإجمالي:</span>
                        <span>{invoice.totalAmount.toFixed(2)} ج.م</span>
                    </div>
                    {invoice.customerName && (
                        <p>العميل: {invoice.customerName}</p>
                    )}
                    <div className="divider"></div>
                    <p className="thank-you">شكراً لزيارتكم!</p>
                    <p className="barcode">*{invoice.invoiceNumber}*</p>
                </div>
            </div>
        );
    }
);
