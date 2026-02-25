import React, { useState, useEffect, useMemo } from 'react';
import { CustomerService } from '../services/CustomerService';
import { Customer, CustomerInput, Invoice } from '../types/models';
import { showToast } from '../utils/toast';
import {
  Users,
  UserPlus,
  TrendingUp,
  History,
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  ArrowRightLeft,
  UsersRound,
  FileText,
  UserCheck
} from 'lucide-react';
import { CustomerListReport, CustomerHistoryReport } from '../components/printing/PrintTemplates';
import { SettingsService } from '../services/SettingsService';
import { PrintService } from '../services/PrintService';
import { SystemSettings } from '../types/models';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';

import { useSearchParams } from 'react-router-dom';

const CustomerManagement: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
  const [viewingHistory, setViewingHistory] = useState<Customer | null>(null);
  const [purchaseHistory, setPurchaseHistory] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<CustomerInput>({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });

  // URL search params logic
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'add') {
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.delete('action');
        return newParams;
      }, { replace: true });

      setEditingCustomer(null);
      setFormData({
        name: '',
        phone: '',
        email: '',
        address: '',
        notes: '',
      });
      setIsModalOpen(true);
    }
  }, [searchParams, setSearchParams]);
  const [error, setError] = useState<string>('');
  const [stats, setStats] = useState({
    total: 0,
    newToday: 0,
    activeWithPurchases: 0,
    highValue: 0
  });
  const [settings, setSettings] = useState<SystemSettings | null>(null);

  const printRef = React.useRef<HTMLDivElement>(null);
  const historyPrintRef = React.useRef<HTMLDivElement>(null);

  const customerService = useMemo(() => new CustomerService(), []);
  const printService = useMemo(() => new PrintService(), []);

  const handleSaveListPDF = async () => {
    showToast.info('جاري تجهيز تقرير العملاء...');
    try {
      if (!settings) return;

      const htmlContent = `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 40px;">
          <h1 style="text-align: center; color: #4f46e5; margin-bottom: 20px;">تقرير قائمة العملاء</h1>
          <p style="text-align: center; color: #6b7280; margin-bottom: 30px;">التاريخ: ${new Date().toLocaleDateString('ar-SA')}</p>
          <table style="width: 100%; border-collapse: collapse; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <thead>
              <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                <th style="padding: 12px; text-align: right; border: 1px solid #e2e8f0;">اسم العميل</th>
                <th style="padding: 12px; text-align: right; border: 1px solid #e2e8f0;">رقم الهاتف</th>
                <th style="padding: 12px; text-align: right; border: 1px solid #e2e8f0;">الرصيد الافتتاحي</th>
                <th style="padding: 12px; text-align: right; border: 1px solid #e2e8f0;">الرصيد الحالي</th>
              </tr>
            </thead>
            <tbody>
              ${customers.map(c => `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 12px; border: 1px solid #e2e8f0;">${c.name}</td>
                  <td style="padding: 12px; border: 1px solid #e2e8f0;">${c.phone || '-'}</td>
                  <td style="padding: 12px; border: 1px solid #e2e8f0;">${(c.totalPurchases || 0).toLocaleString()}</td>
                  <td style="padding: 12px; border: 1px solid #e2e8f0;">${(c.totalPurchases || 0).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;

      await printService.saveHtmlAsPDF(htmlContent, {
        filename: `customer-list-${new Date().getTime()}.pdf`
      });
      showToast.success('تم حفظ التقرير بنجاح');
    } catch (error) {
      console.error('PDF error:', error);
      showToast.error('فشل في حفظ التقرير');
    }
  };

  const handleSaveHistoryPDF = async () => {
    if (!viewingHistory || !settings) return;
    showToast.info('جاري تحضير ملف PDF...');
    try {
      const htmlContent = `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 40px;">
          <h1 style="text-align: center; color: #4f46e5; margin-bottom: 10px;">سجل مشتريات العميل</h1>
          <h3 style="text-align: center; color: #1e293b; margin-bottom: 30px;">العميل: ${viewingHistory.name}</h3>
          <table style="width: 100%; border-collapse: collapse; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <thead>
              <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                <th style="padding: 12px; text-align: right; border: 1px solid #e2e8f0;">التاريخ</th>
                <th style="padding: 12px; text-align: right; border: 1px solid #e2e8f0;">رقم الفاتورة</th>
                <th style="padding: 12px; text-align: right; border: 1px solid #e2e8f0;">المبلغ</th>
              </tr>
            </thead>
            <tbody>
              ${purchaseHistory.map(h => `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 12px; border: 1px solid #e2e8f0;">${new Date(h.createdAt).toLocaleDateString('ar-SA')}</td>
                  <td style="padding: 12px; border: 1px solid #e2e8f0;">${h.invoiceNumber || h.id}</td>
                  <td style="padding: 12px; border: 1px solid #e2e8f0;">${h.totalAmount.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;

      await printService.saveHtmlAsPDF(htmlContent, {
        filename: `history-${viewingHistory.name}-${new Date().getTime()}.pdf`
      });
      showToast.success('تم حفظ السجل بنجاح');
    } catch (error) {
      console.error('History PDF error:', error);
      showToast.error('خطأ في حفظ الملف');
    }
  };

  useEffect(() => {
    loadCustomers();
    loadSettings();
  }, [customerService]);

  const loadSettings = async () => {
    const settingsService = new SettingsService();
    const response = await settingsService.getSettings();
    if (response.success && response.data) {
      setSettings(response.data);
    }
  };

  useEffect(() => {
    filterCustomers();
    calculateStats();
  }, [customers, searchTerm]);

  const calculateStats = () => {
    const today = new Date().toDateString();

    setStats({
      total: customers.length,
      newToday: customers.filter(c => c.createdAt && new Date(c.createdAt).toDateString() === today).length,
      activeWithPurchases: customers.filter(c => (c.totalPurchases || 0) > 0).length,
      highValue: customers.filter(c => (c.totalPurchases || 0) > 5000).length
    });
  };

  const loadCustomers = async () => {
    const response = await customerService.getAllCustomers();
    if (response.success) {
      setCustomers(response.data);
    } else {
      showToast.error(response.error.message);
    }
  };

  const filterCustomers = () => {
    if (!searchTerm) {
      setFilteredCustomers(customers);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(term) ||
        customer.phone?.toLowerCase().includes(term) ||
        customer.email?.toLowerCase().includes(term)
    );
    setFilteredCustomers(filtered);
  };

  const handleOpenModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name,
        phone: customer.phone || '',
        email: customer.email || '',
        address: customer.address || '',
        notes: customer.notes || '',
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        name: '',
        phone: '',
        email: '',
        address: '',
        notes: '',
      });
    }
    setError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
    setError('');
  };

  const handleSubmit = async () => {
    setError('');

    let response;
    if (editingCustomer) {
      response = await customerService.updateCustomer(editingCustomer.id, formData);
    } else {
      response = await customerService.createCustomer(formData);
    }

    if (response.success) {
      showToast.success(
        editingCustomer ? 'تم تحديث العميل بنجاح' : 'تم إضافة العميل بنجاح'
      );
      handleCloseModal();
      loadCustomers();
    } else {
      setError(response.error.message);
      showToast.error(response.error.message);
    }
  };

  const handleOpenDeleteModal = (customer: Customer) => {
    setDeletingCustomer(customer);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingCustomer(null);
  };

  const handleDelete = async () => {
    if (!deletingCustomer) return;

    setError('');

    const response = await customerService.deleteCustomer(deletingCustomer.id);

    if (response.success) {
      showToast.success('تم حذف العميل بنجاح');
      handleCloseDeleteModal();
      loadCustomers();
    } else {
      setError(response.error.message);
      showToast.error(response.error.message);
    }
  };

  const handleViewHistory = async (customer: Customer) => {
    setViewingHistory(customer);
    const response = await customerService.getCustomerPurchaseHistory(customer.id);
    if (response.success) {
      setPurchaseHistory(response.data);
      setIsHistoryModalOpen(true);
    } else {
      showToast.error(response.error.message);
    }
  };

  const handleCloseHistoryModal = () => {
    setIsHistoryModalOpen(false);
    setViewingHistory(null);
    setPurchaseHistory([]);
  };

  return (
    <div className="p-8 space-y-8 bg-app-bg min-h-screen rtl font-geist">
      {/* Header section with Stats - Bento Style */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tight mb-1 font-tajawal">إدارة العملاء</h1>
          <p className="text-muted-foreground font-medium font-tajawal">نظرة عامة على قاعدة البيانات والنشاط</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => handleOpenModal()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-6 h-auto shadow-lg shadow-indigo-100 transition-all active:scale-95 group font-tajawal"
          >
            <Plus className="w-5 h-5 ml-2 group-hover:rotate-90 transition-transform duration-300" />
            <span className="text-lg font-bold">إضافة عميل جديد</span>
          </Button>
          {settings && (
            <Button
              variant="outline"
              onClick={() => handleSaveListPDF()}
              className="rounded-xl px-6 py-6 h-auto border-border hover:bg-surface-muted transition-all font-tajawal gap-2"
            >
              <FileText className="w-5 h-5 text-muted-foreground group-hover:text-indigo-600" />
              <span className="text-lg font-bold text-foreground">حفظ كـ PDF</span>
            </Button>
          )}
        </div>
      </div>

      {/* Hidden Print Containers */}
      <div className="absolute opacity-0 pointer-events-none -z-50 overflow-hidden h-0 w-0" aria-hidden="true">
        {settings && (
          <>
            <CustomerListReport
              ref={printRef}
              customers={filteredCustomers}
              settings={settings}
            />
            {viewingHistory && (
              <CustomerHistoryReport
                ref={historyPrintRef}
                customer={viewingHistory}
                invoices={purchaseHistory}
                settings={settings}
              />
            )}
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Customers Card */}
        <Card className="border-border shadow-sm bg-surface-bg overflow-hidden group hover:shadow-md transition-shadow rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-indigo-50 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <UsersRound className="w-6 h-6 text-indigo-600" />
              </div>
              <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-none font-bold font-tajawal">
                الإجمالي
              </Badge>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-black text-foreground">{stats.total}</h3>
              <p className="text-muted-foreground text-sm font-medium mt-1 font-tajawal">مشترك في النظام</p>
            </div>
          </CardContent>
        </Card>

        {/* New Today Card */}
        <Card className="border-slate-200 shadow-sm bg-white overflow-hidden group hover:shadow-md transition-shadow rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-emerald-50 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <UserPlus className="w-6 h-6 text-emerald-600" />
              </div>
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-none font-bold font-tajawal">
                اليوم
              </Badge>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-black text-foreground">+{stats.newToday}</h3>
              <p className="text-muted-foreground text-sm font-medium mt-1 font-tajawal">عملاء جدد</p>
            </div>
          </CardContent>
        </Card>

        {/* High Value Card */}
        <Card className="border-slate-200 shadow-sm bg-white overflow-hidden group hover:shadow-md transition-shadow rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-amber-50 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
              <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-none font-bold font-tajawal">
                كبار العملاء
              </Badge>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-black text-foreground">{stats.highValue}</h3>
              <p className="text-muted-foreground text-sm font-medium mt-1 font-tajawal">أكثر من 5000 ج.م</p>
            </div>
          </CardContent>
        </Card>

        {/* Active Support Card */}
        <Card className="border-slate-200 shadow-sm bg-white overflow-hidden group hover:shadow-md transition-shadow rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-rose-50 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <UserCheck className="w-6 h-6 text-rose-600" />
              </div>
              <Badge variant="secondary" className="bg-rose-50 text-rose-700 border-none font-bold font-tajawal">
                نشطين
              </Badge>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-black text-foreground">{stats.activeWithPurchases}</h3>
              <p className="text-muted-foreground text-sm font-medium mt-1 font-tajawal">لديهم مشتريات</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <Card className="border-border shadow-sm bg-surface-bg rounded-3xl overflow-hidden border-none shadow-xl shadow-foreground/5">
        <CardHeader className="p-8 pb-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <CardTitle className="text-2xl font-black text-foreground flex items-center gap-3 font-tajawal">
              <div className="h-8 w-2 bg-indigo-600 rounded-full" />
              قائمة العملاء
            </CardTitle>
            <div className="relative w-full md:w-96 group">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-indigo-600 transition-colors" />
              <Input
                placeholder="البحث بالاسم، الهاتف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-12 h-12 bg-surface-muted border-border rounded-2xl focus-visible:ring-indigo-600 transition-all font-medium font-tajawal text-foreground"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-surface-muted/50 border-b border-border">
                <TableRow>
                  <TableHead className="text-right text-muted-foreground font-black text-[10px] uppercase tracking-wider h-14 pr-8 font-tajawal">العميل</TableHead>
                  <TableHead className="text-right text-muted-foreground font-black text-[10px] uppercase tracking-wider h-14 font-tajawal">الهاتف</TableHead>
                  <TableHead className="text-right text-muted-foreground font-black text-[10px] uppercase tracking-wider h-14 font-tajawal">إجمالي المشتريات</TableHead>
                  <TableHead className="text-center font-black uppercase tracking-wider text-[10px] text-muted-foreground py-6">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center space-y-4 font-tajawal">
                        <div className="p-4 bg-surface-muted rounded-full">
                          <UsersRound className="w-12 h-12 text-muted-foreground/30" />
                        </div>
                        <div>
                          <p className="text-xl font-bold text-foreground">{searchTerm ? 'لا توجد نتائج بحث' : 'لا يوجد عملاء بعد'}</p>
                          <p className="text-muted-foreground">ابدأ بإضافة عملاء جدد إلى قاعدة البيانات الخاصة بك</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.id} className="group hover:bg-slate-50/80 transition-colors border-b border-slate-50">
                      <TableCell className="pr-8 py-4">
                        <div className="flex items-center gap-4 font-tajawal">
                          <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-lg">
                            {customer.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{customer.name}</div>
                            <div className="text-xs text-slate-500 font-medium">{customer.email || 'بدون بريد إلكتروني'}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2 font-bold text-slate-700 font-tajawal">
                          <span className="p-1.5 bg-surface-muted rounded-lg"><Users className="w-4 h-4 text-muted-foreground" /></span>
                          {customer.phone || 'بدون هاتف'}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 font-black text-foreground font-tajawal">
                        {(customer.totalPurchases || 0).toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewHistory(customer)}
                            className="h-10 w-10 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-xl"
                          >
                            <Eye className="w-5 h-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenModal(customer)}
                            className="h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-surface-muted rounded-xl"
                          >
                            <Pencil className="w-5 h-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDeleteModal(customer)}
                            className="h-10 w-10 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl"
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        <div className="p-6 bg-surface-muted/50 border-t border-border flex justify-between items-center text-xs font-bold text-muted-foreground uppercase font-tajawal">
          <span>إجمالي السجلات: {filteredCustomers.length}</span>
        </div>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isModalOpen} onOpenChange={(open) => !open && handleCloseModal()}>
        <DialogContent className="max-w-xl p-0 overflow-hidden rounded-3xl border-none shadow-2xl font-tajawal bg-surface-bg">
          <DialogHeader className="p-8 bg-surface-muted border-b border-border">
            <DialogTitle className="text-2xl font-black text-foreground">
              {editingCustomer ? 'تحديث بيانات العميل' : 'إضافة عميل جديد'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium">
              أدخل تفاصيل العميل أدناه. الحقول المميزة بـ * مطلوبة.
            </DialogDescription>
          </DialogHeader>

          <div className="p-8 space-y-6">
            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400 text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="h-2 w-2 bg-rose-500 rounded-full animate-pulse" />
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-foreground/70 pr-2">الاسم الكامل *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: محمد علي"
                  className="h-12 bg-surface-muted border-border rounded-xl focus-visible:ring-indigo-600 text-foreground"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-foreground/70 pr-2">رقم الهاتف</label>
                <Input
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="01xxxxxxxxx"
                  className="h-12 bg-surface-muted border-border rounded-xl focus-visible:ring-indigo-600 text-foreground"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-foreground/70 pr-2">البريد الإلكتروني</label>
                <Input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="example@email.com"
                  className="h-12 bg-surface-muted border-border rounded-xl focus-visible:ring-indigo-600 text-foreground"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-foreground/70 pr-2">العنوان</label>
                <Input
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="القاهرة، مصر"
                  className="h-12 bg-surface-muted border-border rounded-xl focus-visible:ring-indigo-600 text-foreground"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-foreground/70 pr-2">ملاحظات إضافية</label>
              <Input
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="أي معلومات إضافية عن العميل"
                className="h-12 bg-surface-muted border-border rounded-xl focus-visible:ring-indigo-600 text-foreground"
              />
            </div>
          </div>

          <DialogFooter className="p-8 bg-surface-muted border-t border-border gap-3">
            <Button variant="outline" onClick={handleCloseModal} className="rounded-xl font-bold h-12 px-6 border-border text-foreground hover:bg-surface-bg">إلغاء</Button>
            <Button onClick={handleSubmit} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold h-12 px-8">
              {editingCustomer ? 'حفظ التغييرات' : 'تأكيد الإضافة'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteModalOpen} onOpenChange={(open) => !open && handleCloseDeleteModal()}>
        <DialogContent className="max-w-md p-8 rounded-3xl font-tajawal">
          <DialogHeader>
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-rose-50 rounded-full">
                <Trash2 className="w-12 h-12 text-rose-600" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl font-black text-foreground">تأكيد الحذف</DialogTitle>
            <DialogDescription className="text-center text-muted-foreground font-medium pt-2">
              هل أنت متأكد من حذف العميل <span className="text-rose-600 font-bold">{deletingCustomer?.name}</span>؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-3 pt-6">
            <Button variant="outline" onClick={handleCloseDeleteModal} className="w-full rounded-xl font-bold h-12 border-border text-foreground">تراجع</Button>
            <Button variant="destructive" onClick={handleDelete} className="w-full bg-rose-600 hover:bg-rose-700 rounded-xl font-bold h-12">حذف نهائياً</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Purchase History Dialog */}
      <Dialog open={isHistoryModalOpen} onOpenChange={(open) => !open && handleCloseHistoryModal()}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-3xl border-none shadow-2xl font-tajawal bg-surface-bg">
          <DialogHeader className="p-8 bg-surface-muted border-b border-border flex flex-row justify-between items-center">
            <div className="space-y-1">
              <DialogTitle className="text-2xl font-black text-foreground flex items-center gap-3">
                <History className="w-6 h-6 text-indigo-600" />
                سجل مشتريات {viewingHistory?.name}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground font-medium">
                قائمة بجميع الفواتير السابقة المرتبطة بهذا العميل
              </DialogDescription>
            </div>
            {purchaseHistory.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSaveHistoryPDF()}
                className="gap-2 rounded-xl px-4 py-5 font-bold border-border hover:bg-surface-bg transition-all text-indigo-600 border-indigo-100 bg-indigo-50/30"
              >
                <FileText className="w-4 h-4" />
                حفظ السجل PDF
              </Button>
            )}
          </DialogHeader>

          <div className="p-8 max-h-[60vh] overflow-y-auto space-y-4">
            {purchaseHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                <FileText className="w-16 h-16 text-muted-foreground/20" />
                <p className="text-lg font-bold text-muted-foreground/50">لا توجد فواتير سابقة لهذا العميل</p>
              </div>
            ) : (
              purchaseHistory.map((invoice) => (
                <div key={invoice.id} className="p-6 bg-surface-muted rounded-2xl border border-border flex justify-between items-center group transition-all hover:border-indigo-500/30 hover:bg-surface-bg hover:shadow-lg hover:shadow-indigo-500/5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-foreground tracking-tight">#{invoice.invoiceNumber}</span>
                      <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-500 border-none font-black text-[10px]">
                        {invoice.pricingType === 'wholesale' ? 'جملة' : 'قطاعي'}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                      <ArrowRightLeft className="w-4 h-4" />
                      {invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString('ar-EG', { dateStyle: 'long' }) : 'التاريخ غير موجود'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-indigo-500 group-hover:scale-110 transition-transform origin-left">
                      {(invoice.totalAmount || 0).toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}
                    </div>
                    <div className="text-xs text-muted-foreground font-bold uppercase">{invoice.paymentMethod || 'نقدي'}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          <DialogFooter className="p-8 bg-surface-muted border-t border-border">
            <Button variant="outline" onClick={handleCloseHistoryModal} className="w-full rounded-xl font-bold h-12 border-border text-foreground">إغلاق النافذة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerManagement;
