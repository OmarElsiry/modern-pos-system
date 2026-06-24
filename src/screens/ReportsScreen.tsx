import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ReportService,
  SalesReport,
  ProductSalesData,
  DailySalesData,
  CategorySalesData
} from '../services/ReportService';
import {
  TrendingUp,
  Calendar,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  DollarSign,
  FileText,
  RefreshCcw,
  ShoppingBag,
  Store,
  RotateCcw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ReportBarChart = React.lazy(() => import('../components/charts/ReportCharts').then(m => ({ default: m.ReportBarChart })));
const ReportLineChart = React.lazy(() => import('../components/charts/ReportCharts').then(m => ({ default: m.ReportLineChart })));
const ReportPieChart = React.lazy(() => import('../components/charts/ReportCharts').then(m => ({ default: m.ReportPieChart })));

type ReportPeriod = 'today' | 'week' | 'month' | 'custom';

interface ReportsScreenProps {
  onScreenChange?: (screen: string) => void;
}

const ReportsScreen: React.FC<ReportsScreenProps> = () => {
  const { t } = useTranslation();

  const ChartLoader = () => (
    <div className="flex flex-col items-center justify-center h-full min-h-[300px] bg-surface-muted/50 rounded-3xl border border-dashed border-border animate-pulse">
      <div className="rounded-full h-10 w-10 border-b-2 border-primary animate-spin mb-4"></div>
      <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('reports.loading')}</span>
    </div>
  );
  const [period, setPeriod] = useState<ReportPeriod>('today');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [salesSummary, setSalesSummary] = useState<SalesReport | null>(null);
  const [bestProducts, setBestProducts] = useState<ProductSalesData[]>([]);
  const [dailySales, setDailySales] = useState<DailySalesData[]>([]);
  const [categorySales, setCategorySales] = useState<CategorySalesData[]>([]);
  const [loading, setLoading] = useState(false);

  const reportService = useMemo(() => new ReportService(), []);

  const getDateRange = useCallback((): { start: Date; end: Date } => {
    const now = new Date();
    let start: Date;
    let end: Date = new Date(now);

    switch (period) {
      case 'today':
        start = new Date(now);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'week':
        start = new Date(now);
        start.setDate(now.getDate() - 7);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'month':
        start = new Date(now);
        start.setDate(now.getDate() - 30);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'custom':
        if (!startDate || !endDate) {
          start = new Date(now);
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
        } else {
          start = new Date(startDate);
          end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
        }
        break;
      default:
        start = new Date(now);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
    }

    return { start, end };
  }, [period, startDate, endDate]);

  const loadReport = useCallback(async () => {
    setLoading(true);
    try {
      const { start, end } = getDateRange();

      const [summary, products, daily, categories] = await Promise.all([
        reportService.getSalesSummary(start, end),
        reportService.getBestSellingProducts(start, end, 10),
        reportService.getDailySales(start, end),
        reportService.getSalesByCategory(start, end)
      ]);

      setSalesSummary(summary);
      setBestProducts(products);
      setDailySales(daily);
      setCategorySales(categories);
    } catch (error) {
      console.error('Error loading report:', error);
    } finally {
      setLoading(false);
    }
  }, [getDateRange, reportService]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto bg-app-bg min-h-screen rtl" dir="rtl">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold w-fit mb-4">
            <TrendingUp size={14} />
            <span>{t('reports.overview')}</span>
          </div>
          <h1 className="text-4xl font-black text-foreground mb-2">{t('reports.pageTitle')}</h1>
          <p className="text-muted-foreground font-medium">{t('reports.pageDesc')}</p>
        </div>
        <Button
          onClick={loadReport}
          disabled={loading}
          variant="outline"
          className="h-12 px-6 rounded-2xl border-border bg-surface-bg font-bold gap-2 transition-all hover:bg-surface-muted"
        >
          <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
          {t('reports.updateData')}
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface-bg p-5 rounded-3xl border border-border shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="flex items-center gap-3 bg-surface-muted p-1 rounded-2xl w-full md:w-auto overflow-x-auto no-scrollbar">
          {[
            { id: 'today', label: t('reports.today') },
            { id: 'week', label: t('reports.last7Days') },
            { id: 'month', label: t('reports.last30Days') },
            { id: 'custom', label: t('reports.customPeriod') }
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id as ReportPeriod)}
              className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all shrink-0 ${period === p.id
                ? "bg-surface-bg text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground hover:bg-surface-bg/50"
                }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {period === 'custom' && (
          <div className="flex flex-1 items-center gap-3 w-full animate-in fade-in slide-in-from-right-2 duration-300">
            <div className="relative flex-1">
              <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pr-11 h-12 rounded-2xl border border-border bg-surface-muted focus:bg-surface-bg transition-all text-sm font-black text-foreground"
              />
            </div>
            <span className="text-xs font-black text-muted-foreground">{t('reports.to')}</span>
            <div className="relative flex-1">
              <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pr-11 h-12 rounded-2xl border border-border bg-surface-muted focus:bg-surface-bg transition-all text-sm font-black text-foreground"
              />
            </div>
            <Button onClick={loadReport} className="h-12 rounded-2xl px-6 font-black bg-primary">{t('reports.apply')}</Button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 rounded-3xl bg-surface-bg animate-pulse border border-border"></div>
          ))}
          <div className="md:col-span-3 h-[400px] rounded-3xl bg-surface-bg animate-pulse border border-border"></div>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* Summary Cards */}
          {salesSummary && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="rounded-[32px] border-none bg-surface-bg shadow-xl shadow-foreground/5 overflow-hidden group">
                <CardContent className="p-6 relative">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[100px] -mr-8 -mt-8 transition-all group-hover:scale-110"></div>
                  <div className="flex flex-col gap-4 relative">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <DollarSign size={24} strokeWidth={3} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{t('reports.totalSales')}</p>
                      <h3 className="text-3xl font-black text-foreground">{salesSummary.totalSales.toFixed(0)} <span className="text-sm">{t('common.currencySymbol')}</span></h3>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[32px] border-none bg-surface-bg shadow-xl shadow-foreground/5 overflow-hidden group">
                <CardContent className="p-6 relative">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 rounded-bl-[100px] -mr-8 -mt-8 transition-all group-hover:scale-110"></div>
                  <div className="flex flex-col gap-4 relative">
                    <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                      <FileText size={24} strokeWidth={3} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{t('reports.invoicesCount')}</p>
                      <h3 className="text-3xl font-black text-foreground">{salesSummary.totalInvoices} <span className="text-sm">{t('invoices.invoiceNumber')}</span></h3>
                    </div>
                  </div>
                </CardContent>
              </Card>


              <Card className="rounded-[32px] border-none bg-surface-bg shadow-xl shadow-foreground/5 overflow-hidden group">
                <CardContent className="p-6 relative">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-bl-[100px] -mr-8 -mt-8 transition-all group-hover:scale-110"></div>
                  <div className="flex flex-col gap-4 relative">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                      <Store size={24} strokeWidth={3} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{t('reports.wholesaleRetail')}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-black text-foreground">{salesSummary.wholesaleSales.toFixed(0)}</span>
                        <span className="text-muted-foreground text-xs">/</span>
                        <span className="text-xl font-black text-foreground">{salesSummary.retailSales.toFixed(0)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[32px] border-none bg-surface-bg shadow-xl shadow-foreground/5 overflow-hidden group">
                <CardContent className="p-6 relative">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-bl-[100px] -mr-8 -mt-8 transition-all group-hover:scale-110"></div>
                  <div className="flex flex-col gap-4 relative">
                    <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
                      <RotateCcw size={24} strokeWidth={3} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{t('reports.refunds')}</p>
                      <h3 className="text-3xl font-black text-foreground">{(salesSummary.refundedTotal || 0).toFixed(0)} <span className="text-sm">{t('common.currencySymbol')}</span></h3>
                      <p className="text-xs text-muted-foreground mt-1">{salesSummary.refundedCount || 0} {t('invoices.refundInvoice')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Charts Row 1: Line Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <Card className="lg:col-span-8 rounded-[40px] border-none bg-surface-bg shadow-xl shadow-foreground/5 overflow-hidden">
              <CardHeader className="p-8 pb-0">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl font-black text-foreground flex items-center gap-2">
                      <TrendingUp className="text-primary" />
                      {t('reports.dailySales')}
                    </CardTitle>
                    <CardDescription className="text-xs font-bold font-tajawal mt-1">{t('reports.dailySalesDesc')}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 pt-6">
                <React.Suspense fallback={<ChartLoader />}>
                  {dailySales.length > 0 ? (
                    <ReportLineChart data={dailySales} />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground/30 gap-4">
                      <BarChartIcon size={48} strokeWidth={1} />
                      <p className="text-sm font-bold">{t('common.noData')}</p>
                    </div>
                  )}
                </React.Suspense>
              </CardContent>
            </Card>

            <Card className="lg:col-span-4 rounded-[40px] border-none bg-surface-bg shadow-xl shadow-foreground/5 overflow-hidden">
              <CardHeader className="p-8 pb-0">
                <CardTitle className="text-xl font-black text-foreground flex items-center gap-2">
                  <PieChartIcon className="text-secondary" />
                  {t('reports.categoryDist')}
                </CardTitle>
                <CardDescription className="text-xs font-bold font-tajawal mt-1">{t('reports.categoryDistDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-6">
                <React.Suspense fallback={<ChartLoader />}>
                  {categorySales.length > 0 ? (
                    <ReportPieChart data={categorySales} />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground/30 gap-4">
                      <PieChartIcon size={48} strokeWidth={1} />
                      <p className="text-sm font-bold">{t('reports.noCategoryData')}</p>
                    </div>
                  )}
                </React.Suspense>
              </CardContent>
            </Card>
          </div>

          {/* Row 2: Bar Chart */}
          <Card className="rounded-[40px] border-none bg-surface-bg shadow-xl shadow-foreground/5 overflow-hidden">
            <CardHeader className="p-8 pb-0">
              <CardTitle className="text-xl font-black text-foreground flex items-center gap-2">
                <BarChartIcon className="text-primary" />
                {t('reports.topProducts')}
              </CardTitle>
              <CardDescription className="text-xs font-bold font-tajawal mt-1">{t('reports.topProductsDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-6">
              <React.Suspense fallback={<ChartLoader />}>
                {bestProducts.length > 0 ? (
                  <ReportBarChart data={bestProducts} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground/30 gap-4">
                    <ShoppingBag size={64} strokeWidth={1} />
                    <p className="text-sm font-bold">{t('reports.noProductData')}</p>
                  </div>
                )}
              </React.Suspense>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ReportsScreen;
