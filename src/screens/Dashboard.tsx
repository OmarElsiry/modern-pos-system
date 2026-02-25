import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
// Recharts moved to lazy loaded component
import { ProductService } from '../services/ProductService';
import { CustomerService } from '../services/CustomerService';
import { ReportService } from '../services/ReportService';
import { SalesService } from '../services/SalesService';
import { useStockAlerts } from '../hooks/useStockAlerts';
import { ShoppingCart, Users, Package, TrendingUp, Plus, AlertCircle, ArrowUpRight } from 'lucide-react';

const DashboardAreaChart = React.lazy(() => import('../components/charts/DashboardAreaChart'));

interface DashboardStats {
  todaySales: number;
  todayInvoices: number;
  totalProducts: number;
  lowStockCount: number;
  totalCustomers: number;
  recentInvoices: any[];
  weeklySales: any[];
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    todaySales: 0,
    todayInvoices: 0,
    totalProducts: 0,
    lowStockCount: 0,
    totalCustomers: 0,
    recentInvoices: [],
    weeklySales: [],
  });

  const stockAlerts = useStockAlerts();
  const reportService = new ReportService();
  const productService = new ProductService();
  const customerService = new CustomerService();
  const salesService = new SalesService();

  const loadDashboardData = useCallback(async () => {
    try {
      const today = new Date();
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);

      const summary = await reportService.getSalesSummary(today, today);
      const weeklyData = await reportService.getDailySales(lastWeek, today);

      const productsResp = await productService.getAllProducts();
      const customersResp = await customerService.getAllCustomers();
      const recentInvoicesResp = await salesService.getRecentInvoices(5);

      setStats({
        todaySales: summary.totalSales,
        todayInvoices: summary.totalInvoices,
        totalProducts: productsResp.success ? productsResp.data.length : 0,
        lowStockCount: stockAlerts.totalCount,
        totalCustomers: customersResp.success ? customersResp.data.length : 0,
        recentInvoices: recentInvoicesResp.success ? recentInvoicesResp.data : [],
        weeklySales: weeklyData.map((d: any) => ({
          date: new Date(d.date || new Date()).toLocaleDateString('ar-EG', { weekday: 'short' }),
          amount: d.sales || 0
        })),
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  }, [stockAlerts.totalCount]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto" dir="rtl">
      {/* Header section with welcoming feel */}
      <div className="flex justify-between items-end mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">نظرة عامة</h1>
          <p className="text-muted-foreground mt-1">مرحباً بك مجدداً في نظام كاشير جو للبيع.</p>
        </div>
        <button
          onClick={() => navigate('/pos')}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold transition-all"
        >
          <Plus size={20} />
          <span>فاتورة جديدة</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* Sales Hero Card */}
        <div className="md:col-span-4 bg-surface-bg border border-border p-6 rounded-2xl shadow-sm transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <TrendingUp size={24} />
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">مبيعات اليوم</div>
          </div>
          <div className="text-4xl font-black text-foreground mb-2">{formatCurrency(stats.todaySales)}</div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded text-xs font-bold">
              +{stats.todayInvoices} عملية
            </span>
            <span className="text-xs text-muted-foreground">منذ بداية اليوم</span>
          </div>
        </div>

        {/* Weekly Chart Card */}
        <div className="md:col-span-8 bg-surface-bg border border-border p-6 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-foreground">أداء المبيعات الأسبوعي</h3>
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <span>المبيعات بالجنيه</span>
            </div>
          </div>
          <div className="h-[200px] -mx-4">
            <React.Suspense fallback={<div className="h-full flex items-center justify-center bg-surface-muted"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
              <DashboardAreaChart data={stats.weeklySales} />
            </React.Suspense>
          </div>
        </div>

        {/* Secondary Stats Group */}
        <div className="md:col-span-3 bg-surface-bg border border-border p-6 rounded-2xl shadow-sm transition-shadow border-r-4 border-r-sky-500">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-tighter">إجمالي العملاء</span>
            <Users size={20} className="text-sky-500" />
          </div>
          <div className="text-3xl font-bold text-foreground">{stats.totalCustomers}</div>
        </div>

        <div className="md:col-span-3 bg-surface-bg border border-border p-6 rounded-2xl shadow-sm transition-shadow border-r-4 border-r-primary">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-tighter">تشكيلة المنتجات</span>
            <Package size={20} className="text-primary" />
          </div>
          <div className="text-3xl font-bold text-foreground">{stats.totalProducts}</div>
        </div>

        {/* Activity Feed */}
        <div className="md:col-span-6 md:row-span-2 bg-surface-bg border border-border rounded-2xl shadow-sm flex flex-col h-full">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <h3 className="font-bold text-foreground">العمليات الأخيرة</h3>
            <button
              onClick={() => navigate('/invoices')}
              className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              عرض الكل <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <div className="space-y-1">
              {stats.recentInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-muted transition-colors group">
                  <div className="w-10 h-10 rounded-lg bg-surface-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    {invoice.customerName === 'عميل نقدي' ? <Users size={18} /> : <ShoppingCart size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-foreground truncate">{invoice.customerName}</div>
                    <div className="text-xs text-muted-foreground">#{invoice.invoiceNumber} • {invoice.itemCount} منتجات</div>
                  </div>
                  <div className="text-sm font-black text-foreground">{formatCurrency(invoice.totalAmount)}</div>
                </div>
              ))}
              {stats.recentInvoices.length === 0 && (
                <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
                  <Package size={48} className="opacity-10 mb-2" />
                  <p>لا توجد بيانات متاحة حالياً</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stock Alert Card */}
        <div className={`md:col-span-3 bg-surface-bg border p-6 rounded-2xl shadow-sm flex flex-col justify-between transition-all ${stats.lowStockCount > 0 ? 'border-amber-500/50 bg-amber-500/5' : 'border-border'
          }`}>
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h3 className="font-bold text-foreground">تنبيهات المخزون</h3>
              <p className="text-xs text-muted-foreground">المنتجات منخفضة الكمية</p>
            </div>
            <AlertCircle className={stats.lowStockCount > 0 ? 'text-amber-500' : 'text-emerald-500'} size={24} />
          </div>
          <div className="mt-4">
            <div className={`text-4xl font-black ${stats.lowStockCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {stats.lowStockCount}
            </div>
            <button
              onClick={() => navigate('/products')}
              className="mt-2 text-xs font-bold text-muted-foreground hover:text-foreground underline underline-offset-4"
            >
              فحص المخزون
            </button>
          </div>
        </div>

        {/* Quick Access Card */}
        <div className="md:col-span-3 bg-slate-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden group">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <h3 className="font-bold text-sm text-slate-400">إجراءات البيانات</h3>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                onClick={() => navigate('/products')}
                className="flex flex-col items-center gap-2 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
              >
                <Package size={20} />
                <span className="text-[10px] font-bold uppercase">المخزن</span>
              </button>
              <button
                onClick={() => navigate('/customers')}
                className="flex flex-col items-center gap-2 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
              >
                <Users size={20} />
                <span className="text-[10px] font-bold uppercase">العملاء</span>
              </button>
            </div>
          </div>
          {/* Subtle decoration */}
          {/* No decoration */}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;

