import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SalesService } from '../services/SalesService';
import { showToast } from '../utils/toast';
import { cn } from '@/lib/utils';
import {
  Search,
  Calendar,
  User,
  Package,
  FileText,
  Filter,
  ArrowRightLeft,
  ChevronLeft,
  ChevronRight,
  Eye,
  RotateCcw,
  XCircle,
  CheckCircle2,
  Archive,
  AlertTriangle,
  RefreshCcw,
  Receipt,
  FileSpreadsheet
} from 'lucide-react';
import { BrandedInvoiceA4 } from '../components/printing/PrintTemplates';
import { SettingsService } from '../services/SettingsService';
import { SystemSettings, PricingType } from '../types/models';
import { ExportService } from '../services/ExportService';
import { PrintService } from '../services/PrintService';

// Shadcn Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface InvoiceWithDetails {
  id: string;
  invoiceNumber: string;
  totalAmount: number;
  pricingType: PricingType;
  status: 'completed' | 'voided' | 'refunded';
  refundType?: 'defective' | 'good_condition';
  paymentMethod: string;
  customerName?: string;
  itemCount: number;
  createdAt: string;
}

const InvoiceHistory: React.FC = () => {
  const [invoices, setInvoices] = useState<InvoiceWithDetails[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [invoiceToRefund, setInvoiceToRefund] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<SystemSettings | null>(null);

  const invoicePrintRef = React.useRef<HTMLDivElement>(null);

  const printService = useMemo(() => new PrintService(), []);
  const salesService = useMemo(() => new SalesService(), []);

  const handleSaveInvoicePDF = async () => {
    if (!selectedInvoice || !settings) return;
    setIsLoading(true);
    try {
      // Use the branded template if custom template exists, or the standard A4 look
      const result = await printService.saveAsPDF(
        selectedInvoice,
        selectedInvoice.items,
        selectedInvoice.customerName ? { name: selectedInvoice.customerName } as any : undefined,
        { showLogo: true, showTaxNumber: true, showFooter: true },
        settings.a4Template,
        settings.businessInfo
      );
      if (result.success) {
        showToast.success('تم حفظ الفاتورة بصيغة PDF');
      } else if (!result.cancelled) {
        showToast.error('فشل حفظ الفاتورة: ' + result.error);
      }
    } catch (error) {
      showToast.error('خطأ غير متوقع أثناء الحفظ');
    } finally {
      setIsLoading(false);
    }
  };


  const loadInvoices = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await salesService.getAllInvoices();
      if (response.success) {
        const enriched = response.data.map((invoice: any) => ({
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          totalAmount: invoice.totalAmount,
          pricingType: invoice.pricingType,
          status: invoice.status || 'completed',
          refundType: invoice.refundType,
          paymentMethod: invoice.paymentMethod || 'cash',
          customerName: invoice.customerName,
          itemCount: invoice.itemCount,
          createdAt: invoice.createdAt instanceof Date ? invoice.createdAt.toISOString() : invoice.createdAt,
        }));
        setInvoices(enriched);
      } else {
        showToast.error(response.error.message);
      }
    } catch (error) {
      showToast.error('فشل في تحميل الفواتير');
      console.error('Error loading invoices:', error);
    } finally {
      setIsLoading(false);
    }
  }, [salesService]);

  useEffect(() => {
    loadInvoices();
    loadSettings();
  }, [loadInvoices]);

  const loadSettings = async () => {
    const settingsService = new SettingsService();
    const response = await settingsService.getSettings();
    if (response.success && response.data) {
      setSettings(response.data);
    }
  };

  const getPricingTypeName = useCallback((type: string) => {
    if (type === 'wholesale') return settings?.pricingOpts?.tier2Name || 'جملة';
    if (type === 'retail') return settings?.pricingOpts?.tier1Name || 'قطاعي';
    return settings?.pricingOpts?.customTiers?.find(t => t.id === type)?.name || 'مخصص';
  }, [settings]);

  const filteredInvoices = useMemo(() => {
    let filtered = [...invoices];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(inv => inv.status === statusFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        inv =>
          inv.invoiceNumber.toLowerCase().includes(term) ||
          inv.customerName?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [invoices, searchTerm, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const handleViewDetails = async (invoice: InvoiceWithDetails) => {
    try {
      const response = await salesService.getInvoiceById(invoice.id);
      if (response.success) {
        setSelectedInvoice({
          ...response.data,
          customerName: invoice.customerName,
        });
        setIsDetailsModalOpen(true);
      } else {
        showToast.error(response.error.message);
      }
    } catch (error) {
      showToast.error('فشل في تحميل تفاصيل الفاتورة');
    }
  };

  const handleCloseDetails = () => {
    setIsDetailsModalOpen(false);
    setSelectedInvoice(null);
  };

  const handleRefund = async (refundType: 'defective' | 'good_condition') => {
    if (!invoiceToRefund) return;

    try {
      const response = await salesService.refundInvoice(invoiceToRefund, refundType);
      if (response.success) {
        showToast.success('تم استرجاع الفاتورة بنجاح');
        setIsRefundModalOpen(false);
        setInvoiceToRefund(null);
        handleCloseDetails();
        loadInvoices();
      } else {
        showToast.error(response.error.message);
      }
    } catch (error) {
      showToast.error('فشل في عملية الاسترجاع');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusInfo = (status: string, refundType?: string) => {
    switch (status) {
      case 'completed':
        return { label: 'مكتملة', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: CheckCircle2 };
      case 'voided':
        return { label: 'ملغاة', color: 'bg-slate-50 text-slate-500 border-slate-200', icon: XCircle };
      case 'refunded':
        return {
          label: refundType === 'defective' ? 'مرتجعة (تالف)' : 'مرتجعة (سليم)',
          color: 'bg-red-50 text-red-600 border-red-100',
          icon: RotateCcw
        };
      default:
        return { label: 'مكتملة', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: CheckCircle2 };
    }
  };

  const getRefundTypeInfo = (type?: string) => {
    if (type === 'defective') {
      return { label: 'معيب (لا يضاف للمخزون)', color: 'text-red-500 bg-red-50', icon: AlertTriangle };
    }
    return { label: 'حالة جيدة (تمت الإضافة للمخزون)', color: 'text-emerald-500 bg-emerald-50', icon: Archive };
  };

  const handleExport = async () => {
    if (filteredInvoices.length === 0) {
      showToast.error('لا توجد بيانات لتصديرها');
      return;
    }

    const formattedData = ExportService.formatInvoicesForExport(filteredInvoices);
    const result = await ExportService.exportToExcel(
      formattedData,
      `مبيعات_جو_كاشير_${new Date().toISOString().split('T')[0]}`,
      'المبيعات'
    );

    if (result.success) {
      showToast.success('تم تصدير ملف الإكسيل بنجاح');
    } else {
      showToast.error('فشل تصدير الملف');
    }
  };

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto" dir="rtl">

      {/* Header & Stats Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold w-fit mb-4">
            <Calendar size={14} />
            <span>محفوظات العمليات</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-2">سجل الفواتير</h1>
          <p className="text-slate-500 font-medium">عرض وإدارة جميع عمليات البيع السابقة والمرتجعات</p>
        </div>

        <div className="md:col-span-4 grid grid-cols-2 gap-4">
          <Card className="border-slate-200 shadow-sm bg-white overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-none">
                  <FileText size={20} />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 leading-none mb-1">{invoices.length}</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">إجمالي الفواتير</div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm bg-white overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 group-hover:bg-emerald-900 group-hover:text-white transition-none">
                  <ArrowRightLeft size={20} />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 leading-none mb-1">
                {invoices
                  .filter(inv => inv.status === 'completed' || !inv.status)
                  .reduce((sum, inv) => sum + inv.totalAmount, 0)
                  .toLocaleString('ar-EG')}
              </div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">صافي المبيعات</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters & Actions Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="البحث برقم الفاتورة أو اسم العميل..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-12 h-12 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all text-sm font-medium"
          />
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative group w-full md:w-48">
            <Filter className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-slate-900" />
            <select
              className="w-full h-12 pr-10 pl-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-bold appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">كل الحالات</option>
              <option value="completed">مكتملة</option>
              <option value="refunded">مرتجعة</option>
            </select>
          </div>

          <Button
            variant="outline"
            onClick={handleExport}
            className="h-12 w-12 rounded-2xl border-slate-200 group bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all border-none"
            title="تصدير إكسيل"
          >
            <FileSpreadsheet size={20} />
          </Button>

        </div>
      </div>

      {/* Hidden Print Containers */}
      <div style={{ display: 'none' }}>
        {settings && selectedInvoice && (
          <BrandedInvoiceA4
            ref={invoicePrintRef}
            invoice={selectedInvoice}
            settings={settings}
          />
        )}
      </div>

      {/* Data Table */}
      <Card className="border-slate-200 overflow-hidden rounded-3xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="text-right font-black uppercase tracking-wider text-[10px] text-slate-400 py-6 pr-8">رقم الفاتورة</TableHead>
                <TableHead className="text-right font-black uppercase tracking-wider text-[10px] text-slate-400 py-6">التاريخ والوقت</TableHead>
                <TableHead className="text-right font-black uppercase tracking-wider text-[10px] text-slate-400 py-6">العميل</TableHead>
                <TableHead className="text-right font-black uppercase tracking-wider text-[10px] text-slate-400 py-6">الأصناف</TableHead>
                <TableHead className="text-right font-black uppercase tracking-wider text-[10px] text-slate-400 py-6">الإجمالي</TableHead>
                <TableHead className="text-right font-black uppercase tracking-wider text-[10px] text-slate-400 py-6">الحالة</TableHead>
                <TableHead className="text-center font-black uppercase tracking-wider text-[10px] text-slate-400 py-6">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7} className="py-8"><div className="h-4 bg-slate-100 rounded-full w-full"></div></TableCell>
                  </TableRow>
                ))
              ) : paginatedInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-4 text-slate-300">
                      <FileText size={48} strokeWidth={1} />
                      <p className="font-bold">لا يوجد فواتير مطابقة للبحث</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedInvoices.map((invoice) => {
                  const statusInfo = getStatusInfo(invoice.status, invoice.refundType);
                  const StatusIcon = statusInfo.icon;
                  return (
                    <TableRow key={invoice.id} className="group border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-black text-slate-900 py-5 pr-8">
                        <span className="text-slate-900">#</span>{invoice.invoiceNumber}
                      </TableCell>
                      <TableCell className="text-slate-500 font-medium whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-slate-300" />
                          {formatDate(invoice.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-slate-300" />
                          <span className={cn("font-bold", !invoice.customerName && "text-slate-400 italic font-normal")}>
                            {invoice.customerName || "عميل نقدي"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Package size={14} className="text-slate-300" />
                          <span className="font-black text-slate-700">{invoice.itemCount}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-black text-slate-900 whitespace-nowrap">
                          {invoice.totalAmount.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} <span className="text-[10px] text-slate-400 uppercase">ج.م</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("rounded-full px-3 py-1 border font-bold text-[10px] gap-1.5", statusInfo.color)}>
                          <StatusIcon size={12} />
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(invoice)}
                          className="h-9 px-4 rounded-xl hover:bg-slate-100 hover:text-slate-900 font-bold gap-2"
                        >
                          <Eye size={16} />
                          التفاصيل
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-white">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              عرض <span className="text-slate-900">{paginatedInvoices.length}</span> من <span className="text-slate-900">{filteredInvoices.length}</span> فاتورة
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-10 px-4 rounded-xl border-slate-200"
              >
                <ChevronRight size={18} className="ml-1" />
                السابق
              </Button>
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={cn(
                      "w-10 h-10 rounded-xl text-sm font-black transition-all",
                      currentPage === i + 1 ? "bg-slate-900 text-white" : "text-slate-400 hover:bg-slate-50 hover:text-slate-800"
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-10 px-4 rounded-xl border-slate-200"
              >
                التالي
                <ChevronLeft size={18} className="mr-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Invoice Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-2xl rounded-[32px] border-none p-0 overflow-hidden">
          {selectedInvoice && (
            <div className="flex flex-col h-full bg-slate-50">
              {/* Modal Header */}
              <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Receipt size={24} className="text-slate-400" />
                      <span className="text-xs uppercase font-black tracking-widest text-slate-400">فاتورة بيع</span>
                    </div>
                    <h2 className="text-3xl font-black mb-1">#{selectedInvoice.invoiceNumber}</h2>
                    <p className="text-slate-400 text-sm font-medium opacity-80">{formatDate(selectedInvoice.createdAt)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={cn("rounded-full px-4 py-1.5 border-none font-black text-xs shadow-lg", getStatusInfo(selectedInvoice.status).color.replace('bg-', 'bg-white ').replace('text-', 'text-'))}>
                      {getStatusInfo(selectedInvoice.status).label}
                    </Badge>
                    {selectedInvoice.status === 'refunded' && selectedInvoice.refundType && (
                      <div className={cn("flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold shadow-sm", getRefundTypeInfo(selectedInvoice.refundType).color)}>
                        {React.createElement(getRefundTypeInfo(selectedInvoice.refundType).icon, { size: 12 })}
                        {getRefundTypeInfo(selectedInvoice.refundType).label}
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Modal Body */}
              <div className="p-8 space-y-8 flex-1 overflow-y-auto">
                {/* Customer & Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="text-[10px] uppercase font-black text-slate-400 mb-2">العميل</div>
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <User size={16} className="text-slate-400" />
                      {selectedInvoice.customerName || "عميل نقدي"}
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="text-[10px] uppercase font-black text-slate-400 mb-2">نوع التسعير</div>
                    <div className="font-bold text-slate-900">
                      {getPricingTypeName(selectedInvoice.pricingType)}
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">المنتجات المباعة</h4>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{selectedInvoice.items.length} صنف</span>
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                          <TableHead className="text-right text-[10px] font-black uppercase text-slate-400 py-3">المنتج</TableHead>
                          <TableHead className="text-center text-[10px] font-black uppercase text-slate-400 py-3">الكمية</TableHead>
                          <TableHead className="text-left text-[10px] font-black uppercase text-slate-400 py-3 pr-4">الإجمالي</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedInvoice.items.map((item: any) => (
                          <TableRow key={item.id} className="border-slate-50">
                            <TableCell className="font-bold text-slate-700 py-4">{item.productName}</TableCell>
                            <TableCell className="text-center font-black text-slate-500">{item.quantity}</TableCell>
                            <TableCell className="text-left font-black text-slate-900 pr-4">{item.totalPrice.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Summary Card */}
                <div className="bg-slate-900 rounded-[24px] p-6 text-white space-y-4">
                  <div className="flex justify-between items-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                    <span>إجمالي الفاتورة</span>
                    <span className="text-white bg-white/10 px-3 py-1 rounded-full">{selectedInvoice.items.length} قطع</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-2 border-t border-white/10">
                    <span className="text-lg font-bold text-slate-300">القيمة الإجمالية</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black tracking-tight">{selectedInvoice.totalAmount.toFixed(2)}</span>
                      <span className="text-xs font-bold text-slate-400 uppercase">ج.م</span>
                    </div>
                  </div>

                  {selectedInvoice.status === 'refunded' && (
                    <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                      <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">حالة المرتجع</span>
                      <div className={cn("flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black",
                        selectedInvoice.refundType === 'defective' ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400")}>
                        {selectedInvoice.refundType === 'defective' ? <AlertTriangle size={12} /> : <Archive size={12} />}
                        {selectedInvoice.refundType === 'defective' ? 'منتج معيب (لم يتم استرجاع المخزون)' : 'حالة جيدة (تم استرجاع المخزون)'}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-8 pt-0 flex gap-4">
                {selectedInvoice.status === 'completed' && (
                  <Button
                    className="flex-1 h-12 rounded-xl bg-red-100 text-red-600 hover:bg-red-600 hover:text-white font-bold transition-all gap-2 border-none"
                    onClick={() => {
                      setInvoiceToRefund(selectedInvoice.id);
                      setIsRefundModalOpen(true);
                    }}
                  >
                    <RotateCcw size={18} />
                    استرجاع الفاتورة
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="flex-1 h-12 rounded-xl border-slate-200 font-bold hover:bg-slate-100"
                  onClick={handleCloseDetails}
                >
                  إغلاق
                </Button>
                {settings && (
                  <Button
                    onClick={() => handleSaveInvoicePDF()}
                    className="flex-1 h-12 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 font-bold gap-2"
                  >
                    <FileText size={18} />
                    حفظ كـ PDF
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Refund Type Selection Modal */}
      <Dialog open={isRefundModalOpen} onOpenChange={setIsRefundModalOpen}>
        <DialogContent className="max-w-md rounded-[32px] border-none p-0 overflow-hidden bg-white shadow-2xl">
          <div className="p-8 space-y-6 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-4 animate-pulse">
              <RefreshCcw size={32} />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900">استرجاع الفاتورة</h3>
              <p className="text-slate-500 font-medium">يرجى تحديد حالة المنتجات المسترجعة لتحديث المخزون بشكل صحيح</p>
            </div>

            <div className="grid grid-cols-1 gap-3 pt-4">
              <Button
                onClick={() => handleRefund('good_condition')}
                className="h-20 rounded-2xl bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-100 flex flex-col items-center justify-center gap-1 transition-all group border-none shadow-sm"
              >
                <div className="flex items-center gap-2 font-black text-lg">
                  <Archive size={20} className="group-hover:scale-110 transition-transform" />
                  حالة جيدة
                </div>
                <span className="text-[10px] opacity-80 font-bold uppercase tracking-tight">إرجاع المنتجات للمخزون مبيعة مرة أخرى</span>
              </Button>

              <Button
                onClick={() => handleRefund('defective')}
                className="h-20 rounded-2xl bg-red-50 text-red-700 hover:bg-red-600 hover:text-white border border-red-100 flex flex-col items-center justify-center gap-1 transition-all group border-none shadow-sm"
              >
                <div className="flex items-center gap-2 font-black text-lg">
                  <AlertTriangle size={20} className="group-hover:scale-110 transition-transform" />
                  منتج معيب / تالف
                </div>
                <span className="text-[10px] opacity-80 font-bold uppercase tracking-tight">عدم إضافة المنتجات للمخزون (هالك)</span>
              </Button>
            </div>

            <Button
              variant="ghost"
              onClick={() => setIsRefundModalOpen(false)}
              className="w-full h-12 rounded-xl text-slate-400 font-bold hover:bg-slate-50"
            >
              إلغاء العملية
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvoiceHistory;
