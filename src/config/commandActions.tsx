import React from 'react';
import { NavigateFunction } from 'react-router-dom';
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Layers,
    Users,
    History,
    BarChart3,
    Settings,
    Plus,
    Bell,
    FileText,
    Maximize,
    Archive
} from 'lucide-react';
import { PrintService } from '../services/PrintService';
import { ReportPDFService } from '../services/ReportPDFService';
import { SettingsService } from '../services/SettingsService';
import { ReportService } from '../services/ReportService';

export type CommandGroup = 'navigation' | 'products' | 'categories' | 'customers' | 'pdf' | 'system';

export interface CommandContext {
    navigate: NavigateFunction;
    printService: typeof PrintService;
    reportService: typeof ReportService;
    reportPDFService?: typeof ReportPDFService; // Added optional service
    settingsService: typeof SettingsService;
    toggleStockAlerts: () => void;
}

export interface CommandAction {
    id: string;
    label: string;
    keywords: string[];
    icon: React.ReactNode;
    group: CommandGroup;
    action: (ctx: CommandContext) => void | Promise<void>;
    shortcut?: string;
}

// Wrapper components to avoid "Element type is invalid" issues with direct icon usage in some contexts
function ShoppingCartWrapper() { return <ShoppingCart size={18} />; }
function LayoutDashboardWrapper() { return <LayoutDashboard size={18} />; }
function PackageWrapper() { return <Package size={18} />; }
function LayersWrapper() { return <Layers size={18} />; }
function UsersWrapper() { return <Users size={18} />; }
function HistoryWrapper() { return <History size={18} />; }
function BarChart3Wrapper() { return <BarChart3 size={18} />; }
function SettingsWrapper() { return <Settings size={18} />; }
function PlusWrapper() { return <Plus size={18} />; }
function BellWrapper() { return <Bell size={18} />; }
function FileTextWrapper() { return <FileText size={18} />; }
function MaximizeWrapper() { return <Maximize size={18} />; }
function ArchiveWrapper() { return <Archive size={18} />; }

export const commandActions: CommandAction[] = [
    // Navigation
    {
        id: 'nav-pos',
        label: 'نقطة البيع',
        keywords: ['pos', 'sales', 'checkout', 'بيع', 'كاشير'],
        icon: <ShoppingCartWrapper />,
        group: 'navigation',
        action: (ctx) => ctx.navigate('/pos'),
    },
    {
        id: 'nav-dashboard',
        label: 'لوحة التحكم',
        keywords: ['dashboard', 'home', 'stats', 'رئيسية', 'احصائيات'],
        icon: <LayoutDashboardWrapper />,
        group: 'navigation',
        action: (ctx) => ctx.navigate('/dashboard'),
    },
    {
        id: 'nav-products',
        label: 'المنتجات',
        keywords: ['products', 'items', 'inventory', 'منتجات', 'مخزون'],
        icon: <PackageWrapper />,
        group: 'navigation',
        action: (ctx) => ctx.navigate('/products'),
    },
    {
        id: 'nav-categories',
        label: 'الأقسام',
        keywords: ['categories', 'departments', 'groups', 'أقسام', 'تصنيفات'],
        icon: <LayersWrapper />,
        group: 'navigation',
        action: (ctx) => ctx.navigate('/categories'),
    },
    {
        id: 'nav-customers',
        label: 'العملاء',
        keywords: ['customers', 'clients', 'people', 'عملاء', 'زبائن'],
        icon: <UsersWrapper />,
        group: 'navigation',
        action: (ctx) => ctx.navigate('/customers'),
    },
    {
        id: 'nav-invoices',
        label: 'سجل الفواتير',
        keywords: ['invoices', 'history', 'sales', 'فواتير', 'سجل'],
        icon: <HistoryWrapper />,
        group: 'navigation',
        action: (ctx) => ctx.navigate('/invoices'),
    },
    {
        id: 'nav-reports',
        label: 'التقارير',
        keywords: ['reports', 'analytics', 'charts', 'تقارير', 'تحليل'],
        icon: <BarChart3Wrapper />,
        group: 'navigation',
        action: (ctx) => ctx.navigate('/reports'),
    },
    {
        id: 'nav-settings',
        label: 'الإعدادات',
        keywords: ['settings', 'config', 'preferences', 'اعدادات', 'ضبط'],
        icon: <SettingsWrapper />,
        group: 'navigation',
        action: (ctx) => ctx.navigate('/settings'),
    },

    // Products
    {
        id: 'products-add',
        label: 'إضافة منتج جديد',
        keywords: ['add', 'create', 'new', 'product', 'item', 'انشاء', 'اضافة', 'منتج'],
        icon: <PlusWrapper />,
        group: 'products',
        action: (ctx) => ctx.navigate('/products?action=add'),
    },
    {
        id: 'products-alerts',
        label: 'تنبيهات المخزون',
        keywords: ['stock', 'alerts', 'notifications', 'low', 'تنبيهات', 'مخزون', 'نواقص'],
        icon: <BellWrapper />,
        group: 'products',
        action: (ctx) => ctx.toggleStockAlerts(),
    },

    // Categories
    {
        id: 'categories-add',
        label: 'إضافة قسم جديد',
        keywords: ['add', 'create', 'new', 'category', 'group', 'انشاء', 'اضافة', 'قسم'],
        icon: <PlusWrapper />,
        group: 'categories',
        action: (ctx) => ctx.navigate('/categories?action=add'),
    },

    // Customers
    {
        id: 'customers-add',
        label: 'إضافة عميل جديد',
        keywords: ['add', 'create', 'new', 'customer', 'client', 'انشاء', 'اضافة', 'عميل'],
        icon: <PlusWrapper />,
        group: 'customers',
        action: (ctx) => ctx.navigate('/customers?action=add'),
    },

    // PDF Reports
    {
        id: 'pdf-sales',
        label: 'تحميل تقرير المبيعات (PDF)',
        keywords: ['pdf', 'download', 'report', 'sales', 'تحميل', 'تقرير', 'مبيعات'],
        icon: <FileTextWrapper />,
        group: 'pdf',
        action: async () => {
            // Logic will be handled by ReportPDFService call when implemented
            const html = await ReportPDFService.generateSalesReportHTML();
            await ReportPDFService.generatePDF(html, 'sales-report.pdf');
        },
    },
    {
        id: 'pdf-inventory',
        label: 'تحميل تقرير المخزون (PDF)',
        keywords: ['pdf', 'download', 'report', 'inventory', 'stock', 'تحميل', 'تقرير', 'مخزون'],
        icon: <FileTextWrapper />,
        group: 'pdf',
        action: async () => {
            const html = await ReportPDFService.generateInventoryReportHTML();
            await ReportPDFService.generatePDF(html, 'inventory-report.pdf');
        },
    },
    {
        id: 'pdf-customers',
        label: 'تحميل قائمة العملاء (PDF)',
        keywords: ['pdf', 'download', 'report', 'customers', 'clients', 'تحميل', 'تقرير', 'عملاء'],
        icon: <FileTextWrapper />,
        group: 'pdf',
        action: async () => {
            const html = await ReportPDFService.generateCustomerListHTML();
            await ReportPDFService.generatePDF(html, 'customers-list.pdf');
        },
    },

    // System
    {
        id: 'system-fullscreen',
        label: 'ملء الشاشة',
        keywords: ['fullscreen', 'screen', 'toggle', 'شاشة', 'كاملة'],
        icon: <MaximizeWrapper />,
        group: 'system',
        action: () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
            }
        },
    },
    {
        id: 'system-archive',
        label: 'أرشيف النظام',
        keywords: ['archive', 'backup', 'history', 'ارشيف', 'نسخ'],
        icon: <ArchiveWrapper />,
        group: 'system',
        action: (ctx) => ctx.navigate('/settings?tab=archive'),
    },
];
