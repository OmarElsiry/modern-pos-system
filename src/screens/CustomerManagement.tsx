import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
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
  const { t } = useTranslation();
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
    showToast.info(t('customers.toastPreparingPdf'));
    try {
      if (!settings) return;

      const htmlContent = `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 40px;">
          <h1 style="text-align: center; color: #4f46e5; margin-bottom: 20px;">${t('customers.pdfTitle')}</h1>
          <p style="text-align: center; color: #6b7280; margin-bottom: 30px;">${t('invoices.dateTime')}: ${new Date().toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : i18n.language)}</p>
          <table style="width: 100%; border-collapse: collapse; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <thead>
              <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                <th style="padding: 12px; text-align: right; border: 1px solid #e2e8f0;">${t('customers.customer')}</th>
                <th style="padding: 12px; text-align: right; border: 1px solid #e2e8f0;">${t('customers.phone')}</th>
                <th style="padding: 12px; text-align: right; border: 1px solid #e2e8f0;">${t('customers.totalPurchases')}</th>
                <th style="padding: 12px; text-align: right; border: 1px solid #e2e8f0;">${t('customers.totalPurchases')}</th>
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
      showToast.success(t('customers.toastPdfSaved'));
    } catch (error) {
      console.error('PDF error:', error);
      showToast.error(t('customers.toastPdfFailed'));
    }
  };

  const handleSaveHistoryPDF = async () => {
    if (!viewingHistory || !settings) return;
    showToast.info(t('customers.toastPreparingHistory'));
    try {
      const htmlContent = `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 40px;">
          <h1 style="text-align: center; color: #4f46e5; margin-bottom: 10px;">${t('customers.pdfHistoryTitle')}</h1>
          <h3 style="text-align: center; color: #1e293b; margin-bottom: 30px;">${t('customers.customer')}: ${viewingHistory.name}</h3>
          <table style="width: 100%; border-collapse: collapse; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <thead>
              <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                <th style="padding: 12px; text-align: right; border: 1px solid #e2e8f0;">${t('invoices.dateTime')}</th>
                <th style="padding: 12px; text-align: right; border: 1px solid #e2e8f0;">${t('invoices.invoiceNumber')}</th>
                <th style="padding: 12px; text-align: right; border: 1px solid #e2e8f0;">${t('invoices.amount')}</th>
              </tr>
            </thead>
            <tbody>
              ${purchaseHistory.map(h => `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                   <td style="padding: 12px; border: 1px solid #e2e8f0;">${new Date(h.createdAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : i18n.language)}</td>
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
      showToast.success(t('customers.toastPdfSaved'));
    } catch (error) {
      console.error('History PDF error:', error);
      showToast.error(t('customers.toastPdfError'));
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

  const getPricingTypeName = React.useCallback((type: string) => {
    if (type === 'wholesale') return settings?.pricingOpts?.tier2Name || t('pos.tier2Default');
    if (type === 'retail') return settings?.pricingOpts?.tier1Name || t('pos.tier1Default');
    return settings?.pricingOpts?.customTiers?.find(t => t.id === type)?.name || t('pos.otherPrice');
  }, [settings, t]);

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
        editingCustomer ? t('customers.toastUpdated') : t('customers.toastAdded')
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
      showToast.success(t('customers.toastDeleted'));
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
          <h1 className="text-4xl font-black text-foreground tracking-tight mb-1 font-tajawal">{t('customers.pageTitle')}</h1>
          <p className="text-muted-foreground font-medium font-tajawal">{t('customers.pageDesc')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => handleOpenModal()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-6 h-auto shadow-lg shadow-indigo-100 transition-all active:scale-95 group font-tajawal"
          >
            <Plus className="w-5 h-5 ml-2 group-hover:rotate-90 transition-transform duration-300" />
            <span className="text-lg font-bold">{t('customers.addNewCustomer')}</span>
          </Button>
          {settings && (
            <Button
              variant="outline"
              onClick={() => handleSaveListPDF()}
              className="rounded-xl px-6 py-6 h-auto border-border hover:bg-surface-muted transition-all font-tajawal gap-2"
            >
              <FileText className="w-5 h-5 text-muted-foreground group-hover:text-indigo-600" />
              <span className="text-lg font-bold text-foreground">{t('customers.saveAsPdf')}</span>
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
                {t('customers.totalCustomersCard')}
              </Badge>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-black text-foreground">{stats.total}</h3>
              <p className="text-muted-foreground text-sm font-medium mt-1 font-tajawal">{t('customers.subscribed')}</p>
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
                {t('customers.newToday')}
              </Badge>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-black text-foreground">+{stats.newToday}</h3>
              <p className="text-muted-foreground text-sm font-medium mt-1 font-tajawal">{t('customers.newCustomers')}</p>
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
                {t('customers.highValue')}
              </Badge>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-black text-foreground">{stats.highValue}</h3>
              <p className="text-muted-foreground text-sm font-medium mt-1 font-tajawal">{t('customers.highValueDesc')}</p>
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
                {t('customers.active')}
              </Badge>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-black text-foreground">{stats.activeWithPurchases}</h3>
              <p className="text-muted-foreground text-sm font-medium mt-1 font-tajawal">{t('customers.havePurchases')}</p>
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
              {t('customers.customerList')}
            </CardTitle>
            <div className="relative w-full md:w-96 group">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-indigo-600 transition-colors" />
              <Input
                placeholder={t('customers.searchPlaceholder')}
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
                  <TableHead className="text-right text-muted-foreground font-black text-[10px] uppercase tracking-wider h-14 pr-8 font-tajawal">{t('customers.customer')}</TableHead>
                  <TableHead className="text-right text-muted-foreground font-black text-[10px] uppercase tracking-wider h-14 font-tajawal">{t('customers.phone')}</TableHead>
                  <TableHead className="text-right text-muted-foreground font-black text-[10px] uppercase tracking-wider h-14 font-tajawal">{t('customers.totalPurchases')}</TableHead>
                  <TableHead className="text-center font-black uppercase tracking-wider text-[10px] text-muted-foreground py-6">{t('customers.actions')}</TableHead>
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
                          <p className="text-xl font-bold text-foreground">{searchTerm ? t('customers.noResults') : t('customers.noCustomers')}</p>
                          <p className="text-muted-foreground">{t('customers.addCustomersHint')}</p>
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
                            {customer.email && <div className="text-xs text-slate-500 font-medium">{customer.email}</div>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        {customer.phone && (
                          <div className="flex items-center gap-2 font-bold text-slate-700 font-tajawal">
                            <span className="p-1.5 bg-surface-muted rounded-lg"><Users className="w-4 h-4 text-muted-foreground" /></span>
                            {customer.phone}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="py-4 font-black text-foreground font-tajawal">
                        {(customer.totalPurchases || 0).toLocaleString(i18n.language === 'ar' ? 'ar-EG' : i18n.language === 'fa' ? 'fa-IR' : i18n.language, { style: 'currency', currency: t('common.currency') })}
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
          <span>{t('customers.totalRecords', { count: filteredCustomers.length })}</span>
        </div>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isModalOpen} onOpenChange={(open) => !open && handleCloseModal()}>
        <DialogContent className="max-w-xl p-0 overflow-hidden rounded-3xl border-none shadow-2xl font-tajawal bg-surface-bg">
          <DialogHeader className="p-8 bg-surface-muted border-b border-border">
            <DialogTitle className="text-2xl font-black text-foreground">
              {editingCustomer ? t('customers.editTitle') : t('customers.addTitle')}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium">
              {t('customers.addDesc')}
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
                <label className="text-sm font-black text-foreground/70 pr-2">{t('customers.fullName')}</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('customers.fullNamePlaceholder')}
                  className="h-12 bg-surface-muted border-border rounded-xl focus-visible:ring-indigo-600 text-foreground"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-foreground/70 pr-2">{t('customers.phoneLabel')}</label>
                <Input
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder={t('customers.phonePlaceholder')}
                  className="h-12 bg-surface-muted border-border rounded-xl focus-visible:ring-indigo-600 text-foreground"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-foreground/70 pr-2">{t('customers.emailLabel')}</label>
                <Input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={t('customers.emailPlaceholder')}
                  className="h-12 bg-surface-muted border-border rounded-xl focus-visible:ring-indigo-600 text-foreground"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-foreground/70 pr-2">{t('customers.addressLabel')}</label>
                <Input
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder={t('customers.addressPlaceholder')}
                  className="h-12 bg-surface-muted border-border rounded-xl focus-visible:ring-indigo-600 text-foreground"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-foreground/70 pr-2">{t('customers.notesLabel')}</label>
              <Input
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder={t('customers.notesPlaceholder')}
                className="h-12 bg-surface-muted border-border rounded-xl focus-visible:ring-indigo-600 text-foreground"
              />
            </div>
          </div>

          <DialogFooter className="p-8 bg-surface-muted border-t border-border gap-3">
            <Button variant="outline" onClick={handleCloseModal} className="rounded-xl font-bold h-12 px-6 border-border text-foreground hover:bg-surface-bg">{t('customers.cancel')}</Button>
            <Button onClick={handleSubmit} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold h-12 px-8">
              {editingCustomer ? t('customers.saveChanges') : t('customers.confirmAdd')}
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
            <DialogTitle className="text-center text-2xl font-black text-foreground">{t('customers.deleteTitle')}</DialogTitle>
            <DialogDescription className="text-center text-muted-foreground font-medium pt-2">
              {t('customers.deleteConfirm', { name: deletingCustomer?.name })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-3 pt-6">
            <Button variant="outline" onClick={handleCloseDeleteModal} className="w-full rounded-xl font-bold h-12 border-border text-foreground">{t('customers.back')}</Button>
            <Button variant="destructive" onClick={handleDelete} className="w-full bg-rose-600 hover:bg-rose-700 rounded-xl font-bold h-12">{t('customers.deletePermanent')}</Button>
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
                {t('customers.historyFor', { name: viewingHistory?.name })}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground font-medium">
                {t('customers.historyDesc')}
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
                {t('customers.saveHistoryPDF')}
              </Button>
            )}
          </DialogHeader>

          <div className="p-8 max-h-[60vh] overflow-y-auto space-y-4">
            {purchaseHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                <FileText className="w-16 h-16 text-muted-foreground/20" />
                <p className="text-lg font-bold text-muted-foreground/50">{t('customers.noHistory')}</p>
              </div>
            ) : (
              purchaseHistory.map((invoice) => (
                <div key={invoice.id} className="p-6 bg-surface-muted rounded-2xl border border-border flex justify-between items-center group transition-all hover:border-indigo-500/30 hover:bg-surface-bg hover:shadow-lg hover:shadow-indigo-500/5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-foreground tracking-tight">#{invoice.invoiceNumber}</span>
                      <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-500 border-none font-black text-[10px]">
                        {getPricingTypeName(invoice.pricingType)}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                      <ArrowRightLeft className="w-4 h-4" />
                      {invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : i18n.language === 'fa' ? 'fa-IR' : i18n.language, { dateStyle: 'long' }) : t('common.noData')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-indigo-500 group-hover:scale-110 transition-transform origin-left">
                      {(invoice.totalAmount || 0).toLocaleString(i18n.language === 'ar' ? 'ar-EG' : i18n.language === 'fa' ? 'fa-IR' : i18n.language, { style: 'currency', currency: t('common.currency') })}
                    </div>
                    <div className="text-xs text-muted-foreground font-bold uppercase">{invoice.paymentMethod || t('common.no')}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          <DialogFooter className="p-8 bg-surface-muted border-t border-border">
            <Button variant="outline" onClick={handleCloseHistoryModal} className="w-full rounded-xl font-bold h-12 border-border text-foreground">{t('customers.closeWindow')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerManagement;
