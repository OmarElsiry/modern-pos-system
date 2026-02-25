import React, { useEffect, useState } from 'react';
import { Invoice, InvoiceItem, Customer, BusinessInfo, InvoiceTemplate } from '../types/models';
import { PrintService } from '../services/PrintService';
import { SettingsService } from '../services/SettingsService';
import Button from './Button';
import { Printer, Download, X, Loader2 } from 'lucide-react';
import './ReceiptPreview.css';

interface ReceiptPreviewProps {
  invoice: Invoice;
  items: InvoiceItem[];
  customer?: Customer;
  onClose: () => void;
}

const ReceiptPreview: React.FC<ReceiptPreviewProps> = ({
  invoice,
  items,
  customer,
  onClose,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState<InvoiceTemplate | undefined>();
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | undefined>();
  const printService = new PrintService();
  const settingsService = new SettingsService();

  useEffect(() => {
    generatePreview();
  }, [invoice, items, customer]);

  const generatePreview = async () => {
    setLoading(true);
    try {
      const response = await settingsService.getSettings();
      let activeTemplate: InvoiceTemplate | undefined;
      let activeBusinessInfo: BusinessInfo | undefined;

      if (response.success && response.data) {
        activeTemplate = response.data.a4Template;
        activeBusinessInfo = response.data.businessInfo;
        setTemplate(activeTemplate);
        setBusinessInfo(activeBusinessInfo);
      }

      const url = printService.previewReceipt(invoice, items, customer, undefined, activeTemplate, activeBusinessInfo);
      setPreviewUrl(url);
    } catch (error) {
      console.error('Error generating preview:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    printService.printReceipt(invoice, items, customer, undefined, template, businessInfo);
  };

  const handleDownload = () => {
    printService.downloadReceipt(invoice, items, customer, undefined, template, businessInfo);
  };

  return (
    <div className="receipt-preview-overlay" onClick={onClose}>
      <div className="receipt-preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="receipt-preview-header">
          <h3>معاينة الفاتورة</h3>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="receipt-preview-content">
          {loading ? (
            <div className="loading-preview">
              <Loader2 className="animate-spin text-indigo-500" size={32} />
              <span>جاري تحضير المعاينة...</span>
            </div>
          ) : (
            <iframe
              src={previewUrl}
              title="Receipt Preview"
              className="receipt-iframe"
            />
          )}
        </div>

        <div className="receipt-preview-actions">
          <Button onClick={handlePrint} variant="default" className="primary">
            <Printer size={18} /> طباعة
          </Button>
          <Button onClick={handleDownload} variant="default" className="primary bg-slate-800 hover:bg-slate-900">
            <Download size={18} /> تحميل PDF
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPreview;
