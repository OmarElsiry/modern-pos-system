import React, { useState, useEffect } from 'react';
import {
    Settings,
    Archive,
    Save,
    Loader2,
    Store,
    MapPin,
    Phone,
    Mail,
    Database,
    Moon,
    Sun,
    ShieldCheck,
    Palette,
    Layout as LayoutIcon,
    Image as ImageIcon,
    ArrowDown,
    AlignCenter,
    AlignLeft,
    AlignRight,
    FileText
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { showToast } from '../utils/toast';
import { SettingsService } from '../services/SettingsService';
import { ArchiveService } from '../services/ArchiveService';
import { SystemSettings, BusinessInfo } from '../types/models';
import { useTheme } from '../hooks/useTheme';
import { cn } from '@/lib/utils';

const SettingsScreen: React.FC = () => {
    const [settings, setSettings] = useState<SystemSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [archiving, setArchiving] = useState(false);
    const { isDark, toggleTheme } = useTheme();

    const settingsService = new SettingsService();
    const archiveService = new ArchiveService();

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const response = await settingsService.getSettings();
            if (response.success && response.data) {
                setSettings(response.data);
            }
        } catch (error) {
            showToast.error('فشل تحميل الإعدادات');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!settings) return;
        setSaving(true);
        try {
            const response = await settingsService.updateSettings(settings);
            if (response.success) {
                showToast.success('تم حفظ الإعدادات بنجاح');
            } else {
                showToast.error('فشل حفظ الإعدادات');
            }
        } catch (error) {
            showToast.error('خطأ في الاتصال');
        } finally {
            setSaving(false);
        }
    };

    const handleArchiveNow = async () => {
        setArchiving(true);
        try {
            showToast.info('جاري إنشاء الأرشيف اليومي...');
            const result = await archiveService.archiveDailyReport();
            if (result.success) {
                showToast.success(`تم بنجاح! تم الحفظ في: ${result.path}`);
            } else {
                showToast.error(`فشل الأرشفة: ${result.error}`);
            }
        } catch (error) {
            showToast.error('حدث خطأ أثناء الأرشفة');
        } finally {
            setArchiving(false);
        }
    };

    const updateBusinessInfo = (field: keyof BusinessInfo, value: string) => {
        if (!settings) return;
        setSettings({
            ...settings,
            businessInfo: {
                ...settings.businessInfo,
                [field]: value
            }
        });
    };

    const updateSetting = (field: keyof SystemSettings, value: any) => {
        if (!settings) return;
        setSettings({
            ...settings,
            [field]: value
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] bg-app-bg rounded-3xl">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                        <Settings className="absolute inset-0 m-auto text-primary animate-pulse" size={24} />
                    </div>
                    <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">جاري تهيئة الإعدادات...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 max-w-[1600px] mx-auto bg-app-bg min-h-screen pb-32" dir="rtl">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest w-fit">
                        <Palette size={12} />
                        <span>تخصيص وإدارة</span>
                    </div>
                    <h1 className="text-4xl font-black text-foreground">الإعدادات العامة</h1>
                    <p className="text-muted-foreground font-medium">إدارة هوية المتجر، الأتمتة، والسمات البصرية</p>
                </div>
                <div className="flex gap-4">
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-lg shadow-xl shadow-primary/20 gap-3 transition-all hover:scale-105 active:scale-95 border-none"
                    >
                        {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save size={24} />}
                        {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                    </Button>
                </div>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Right Column: Business Info & Actions (Lighter Weight) */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Business Identity Card */}
                    <Card className="rounded-[40px] border-none bg-surface-bg shadow-2xl shadow-foreground/5 overflow-hidden">
                        <CardHeader className="p-8 pb-0">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                    <Store size={28} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-black text-foreground">هوية المتجر</CardTitle>
                                    <CardDescription className="font-medium text-muted-foreground">البيانات الأساسية التي ستظهر على الإيصالات والتقارير</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-3">
                                <Label className="text-xs font-black text-foreground/70 uppercase tracking-widest mr-1">اسم المتجر الرسمي</Label>
                                <div className="relative group">
                                    <Store className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
                                    <Input
                                        value={settings?.businessInfo?.name || ''}
                                        onChange={(e) => updateBusinessInfo('name', e.target.value)}
                                        placeholder="أدخل اسم المتجر"
                                        className="h-14 pr-12 rounded-2xl border-border bg-surface-muted focus:bg-surface-bg transition-all font-bold text-foreground"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-xs font-black text-foreground/70 uppercase tracking-widest mr-1">العنوان بالتفصيل</Label>
                                <div className="relative group">
                                    <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
                                    <Input
                                        value={settings?.businessInfo?.address || ''}
                                        onChange={(e) => updateBusinessInfo('address', e.target.value)}
                                        placeholder="المدينة، الحي، الشارع"
                                        className="h-14 pr-12 rounded-2xl border-border bg-surface-muted focus:bg-surface-bg transition-all font-bold text-foreground"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-xs font-black text-foreground/70 uppercase tracking-widest mr-1">رقم التواصل</Label>
                                <div className="relative group">
                                    <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
                                    <Input
                                        value={settings?.businessInfo?.phone || ''}
                                        onChange={(e) => updateBusinessInfo('phone', e.target.value)}
                                        placeholder="01xxxxxxxxx"
                                        className="h-14 pr-12 rounded-2xl border-border bg-surface-muted focus:bg-surface-bg transition-all font-bold text-foreground"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-xs font-black text-foreground/70 uppercase tracking-widest mr-1">الرقم الضريبي (اختياري)</Label>
                                <div className="relative group">
                                    <ShieldCheck className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
                                    <Input
                                        value={settings?.businessInfo?.taxId || ''}
                                        onChange={(e) => updateBusinessInfo('taxId', e.target.value)}
                                        placeholder="123-456-789"
                                        className="h-14 pr-12 rounded-2xl border-border bg-surface-muted focus:bg-surface-bg transition-all font-bold text-foreground"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-xs font-black text-foreground/70 uppercase tracking-widest mr-1">البريد الإلكتروني</Label>
                                <div className="relative group">
                                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
                                    <Input
                                        value={settings?.businessInfo?.email || ''}
                                        onChange={(e) => updateBusinessInfo('email', e.target.value)}
                                        placeholder="info@yourstore.com"
                                        className="h-14 pr-12 rounded-2xl border-border bg-surface-muted focus:bg-surface-bg transition-all font-bold text-foreground text-left"
                                        dir="ltr"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-xs font-black text-foreground/70 uppercase tracking-widest mr-1">سياسة الاسترجاع والاستبدال</Label>
                                <div className="relative group">
                                    <ShieldCheck className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
                                    <Input
                                        value={settings?.businessInfo?.returnPolicy || ''}
                                        onChange={(e) => updateBusinessInfo('returnPolicy' as any, e.target.value)}
                                        placeholder="لا يوجد استرجاع - يوجد استبدال..."
                                        className="h-14 pr-12 rounded-2xl border-border bg-surface-muted focus:bg-surface-bg transition-all font-bold text-foreground"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-xs font-black text-foreground/70 uppercase tracking-widest mr-1">رسالة التذيل (شكراً لزيارتكم)</Label>
                                <div className="relative group">
                                    <Store className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
                                    <Input
                                        value={settings?.businessInfo?.thankYouNote || ''}
                                        onChange={(e) => updateBusinessInfo('thankYouNote' as any, e.target.value)}
                                        placeholder="شكراً لزيارتكم!"
                                        className="h-14 pr-12 rounded-2xl border-border bg-surface-muted focus:bg-surface-bg transition-all font-bold text-foreground"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Invoice Printing Section */}
                    <Card className="rounded-[40px] border-none bg-surface-bg shadow-2xl shadow-foreground/5 overflow-hidden">
                        <CardHeader className="p-8 pb-0">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                    <FileText size={28} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-black text-foreground">إعدادات الطباعة</CardTitle>
                                    <CardDescription className="font-medium text-muted-foreground">تخصيص مظهر ومحتوى الإيصالات المطبوعة</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            {/* Logos Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                {/* Primary Logo */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs font-black text-foreground/70 uppercase tracking-widest mr-1">الشعار الأساسي</Label>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-muted-foreground">إظهار</span>
                                            <Switch
                                                checked={true}
                                                disabled
                                                className="scale-75"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                        <div className="flex flex-col gap-4">
                                            <div className="relative group w-full aspect-square max-w-[160px] rounded-3xl bg-surface-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden transition-all hover:border-primary/50 mx-auto">
                                                {settings?.businessInfo?.logo ? (
                                                    <>
                                                        <img src={settings.businessInfo.logo} alt="Primary Logo" className="w-full h-full object-contain p-2" />
                                                        <button
                                                            onClick={() => updateBusinessInfo('logo', '')}
                                                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-white text-[10px] font-black uppercase tracking-tighter"
                                                        >
                                                            إزالة الشعار
                                                        </button>
                                                    </>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                        <ImageIcon size={24} />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">لا يوجد</span>
                                                    </div>
                                                )}
                                            </div>
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                id="logo1-upload"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            updateBusinessInfo('logo', reader.result as string);
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                            <Button
                                                asChild
                                                variant="outline"
                                                className="h-10 rounded-xl border-2 font-black text-xs gap-2"
                                            >
                                                <label htmlFor="logo1-upload" className="cursor-pointer">
                                                    <ImageIcon size={16} />
                                                    رفع شعار
                                                </label>
                                            </Button>
                                        </div>

                                        <div className="space-y-4">
                                            <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block text-center">موضع الشعار 1</Label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {[
                                                    { id: 'top-left', icon: <AlignLeft size={14} /> },
                                                    { id: 'top-center', icon: <AlignCenter size={14} /> },
                                                    { id: 'top-right', icon: <AlignRight size={14} /> },
                                                    { id: 'bottom-left', icon: <ArrowDown className="-rotate-45" size={14} /> },
                                                    { id: 'bottom-center', icon: <ArrowDown size={14} /> },
                                                    { id: 'bottom-right', icon: <ArrowDown className="rotate-45" size={14} /> },
                                                ].map((pos) => (
                                                    <button
                                                        key={pos.id}
                                                        onClick={() => updateBusinessInfo('logoPosition' as any, pos.id)}
                                                        className={cn(
                                                            "flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all aspect-square",
                                                            settings?.businessInfo?.logoPosition === pos.id
                                                                ? "border-primary bg-primary/5 text-primary"
                                                                : "border-border bg-surface-muted text-muted-foreground hover:border-primary/20"
                                                        )}
                                                        title={pos.id}
                                                    >
                                                        {pos.icon}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Secondary Logo */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs font-black text-foreground/70 uppercase tracking-widest mr-1">الشعار الثانوي (إضافي)</Label>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-muted-foreground">إظهار</span>
                                            <Switch
                                                checked={settings?.businessInfo?.showLogo2 ?? false}
                                                onCheckedChange={(val) => updateBusinessInfo('showLogo2' as any, val as any)}
                                                className="scale-75"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                        <div className="flex flex-col gap-4">
                                            <div className="relative group w-full aspect-square max-w-[160px] rounded-3xl bg-surface-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden transition-all hover:border-primary/50 mx-auto">
                                                {settings?.businessInfo.logo2 ? (
                                                    <>
                                                        <img src={settings.businessInfo.logo2} alt="Secondary Logo" className="w-full h-full object-contain p-2" />
                                                        <button
                                                            onClick={() => updateBusinessInfo('logo2' as any, '')}
                                                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-white text-[10px] font-black uppercase tracking-tighter"
                                                        >
                                                            إزالة الشعار
                                                        </button>
                                                    </>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                        <ImageIcon size={24} />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">لا يوجد</span>
                                                    </div>
                                                )}
                                            </div>
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                id="logo2-upload"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            updateBusinessInfo('logo2' as any, reader.result as string);
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                            <Button
                                                asChild
                                                variant="outline"
                                                className="h-10 rounded-xl border-2 font-black text-xs gap-2"
                                            >
                                                <label htmlFor="logo2-upload" className="cursor-pointer">
                                                    <ImageIcon size={16} />
                                                    رفع شعار
                                                </label>
                                            </Button>
                                        </div>

                                        <div className="space-y-4">
                                            <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block text-center">موضع الشعار 2</Label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {[
                                                    { id: 'top-left', icon: <AlignLeft size={14} /> },
                                                    { id: 'top-center', icon: <AlignCenter size={14} /> },
                                                    { id: 'top-right', icon: <AlignRight size={14} /> },
                                                    { id: 'bottom-left', icon: <ArrowDown className="-rotate-45" size={14} /> },
                                                    { id: 'bottom-center', icon: <ArrowDown size={14} /> },
                                                    { id: 'bottom-right', icon: <ArrowDown className="rotate-45" size={14} /> },
                                                ].map((pos) => (
                                                    <button
                                                        key={pos.id}
                                                        onClick={() => updateBusinessInfo('logo2Position' as any, pos.id)}
                                                        className={cn(
                                                            "flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all aspect-square",
                                                            settings?.businessInfo?.logo2Position === pos.id
                                                                ? "border-primary bg-primary/5 text-primary"
                                                                : "border-border bg-surface-muted text-muted-foreground hover:border-primary/20"
                                                        )}
                                                        title={pos.id}
                                                    >
                                                        {pos.icon}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Visibility Toggles */}
                            <div className="space-y-4 pt-4 border-t border-border">
                                <Label className="text-xs font-black text-foreground/70 uppercase tracking-widest mr-1">إظهار البيانات في الفاتورة</Label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                        { id: 'showName', label: 'اسم المتجر', icon: <Store size={18} /> },
                                        { id: 'showAddress', label: 'العنوان', icon: <MapPin size={18} /> },
                                        { id: 'showPhone', label: 'رقم الهاتف', icon: <Phone size={18} /> },
                                    ].map((item) => (
                                        <div key={item.id} className="p-4 rounded-2xl bg-surface-muted border border-border flex items-center justify-between group transition-all hover:border-primary/20">
                                            <div className="flex items-center gap-3">
                                                <div className="text-muted-foreground group-hover:text-primary transition-colors">
                                                    {item.icon}
                                                </div>
                                                <span className="text-sm font-black text-foreground">{item.label}</span>
                                            </div>
                                            <Switch
                                                checked={settings?.businessInfo ? (settings.businessInfo as any)[item.id] : true}
                                                onCheckedChange={(val) => {
                                                    if (!settings) return;
                                                    setSettings({
                                                        ...settings,
                                                        businessInfo: {
                                                            ...settings.businessInfo,
                                                            [item.id]: val
                                                        }
                                                    });
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Automation Toggles */}
                            <div className="p-6 rounded-3xl bg-emerald-50/30 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                        <LayoutIcon size={24} />
                                    </div>
                                    <div>
                                        <p className="font-black text-foreground">الطباعة التلقائية</p>
                                        <p className="text-xs text-muted-foreground font-medium">طباعة الإيصال مباشرة بعد إتمام العملية</p>
                                    </div>
                                </div>
                                <Switch
                                    checked={settings?.autoPrint ?? true}
                                    onCheckedChange={(val) => updateSetting('autoPrint', val)}
                                    className="data-[state=checked]:bg-emerald-500"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Appearance Card */}
                    <Card className="rounded-[40px] border-none bg-surface-bg shadow-2xl shadow-foreground/5 overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-xl font-black text-foreground flex items-center gap-2">
                                <Palette size={20} className="text-primary" />
                                المظهر البصري
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-4 space-y-6">
                            <div
                                onClick={toggleTheme}
                                className="flex items-center justify-between p-4 rounded-3xl bg-surface-muted border-2 border-transparent hover:border-primary/20 transition-all cursor-pointer group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg",
                                        isDark ? "bg-slate-900 text-amber-400 rotate-12" : "bg-white text-primary rotate-0"
                                    )}>
                                        {isDark ? <Moon size={24} fill="currentColor" /> : <Sun size={24} />}
                                    </div>
                                    <div>
                                        <p className="font-black text-foreground">{isDark ? 'الوضع الليلي' : 'الوضع النهاري'}</p>
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">تغيير لغة التصميم</p>
                                    </div>
                                </div>
                                <div className="w-10 h-6 bg-surface-bg rounded-full border border-border p-1">
                                    <div className={cn(
                                        "w-4 h-4 rounded-full transition-all",
                                        isDark ? "mr-4 bg-primary" : "mr-0 bg-muted-foreground/30"
                                    )}></div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Data Sovereignty Card */}
                    <Card className="rounded-[40px] border-none bg-amber-500 shadow-xl shadow-amber-500/20 overflow-hidden text-white relative group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-[120px] -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                        <CardHeader className="p-8">
                            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
                                <Database size={24} />
                            </div>
                            <CardTitle className="text-2xl font-black">سيادة البيانات</CardTitle>
                            <CardDescription className="text-amber-50 font-medium">سيتم تخزين كافة البيانات محلياً في مجلد الأرشفة لضمان الخصوصية التامة.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 space-y-6">
                            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                                <p className="text-[10px] font-black uppercase tracking-widest text-amber-100 mb-2">مسار الأرشفة الحالي</p>
                                <p className="text-xs font-mono break-all opacity-90">{settings?.archivePath || 'C:/JOECASHIER/Archives'}</p>
                            </div>
                            <Button
                                onClick={handleArchiveNow}
                                disabled={archiving}
                                className="w-full h-14 rounded-2xl bg-white text-amber-600 hover:bg-amber-50 font-black text-lg gap-3 transition-all active:scale-95 border-none shadow-lg"
                            >
                                {archiving ? <Loader2 size={24} className="animate-spin" /> : <Archive size={24} />}
                                {archiving ? 'جاري الأرشفة...' : 'أرشفة البيانات الآن'}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Security Badge */}
                    <div className="p-6 rounded-[40px] bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <ShieldCheck size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="text-sm font-black text-foreground">النظام مؤمن تماماً</p>
                            <p className="text-[10px] text-muted-foreground font-bold">تشفير AES-256 للبيانات الحساسة</p>
                        </div>
                    </div>
                </div>

                {/* System Info - Bottom Row */}
                <div className="lg:col-span-12">
                    <Card className="rounded-[40px] border-none bg-surface-bg shadow-2xl shadow-foreground/5 overflow-hidden">
                        <CardContent className="p-8 grid grid-cols-2 md:grid-cols-4 gap-8">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">إصدار النظام</span>
                                <span className="text-xl font-black text-foreground">v1.2.5 <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full ml-2">PRO</span></span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">نوع قاعدة البيانات</span>
                                <span className="text-xl font-black text-foreground">SQLite (Local)</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">حالة الاتصال</span>
                                <span className="text-xl font-black text-emerald-500 flex items-center gap-2">
                                    متصل نشط
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                </span>
                            </div>
                            <div className="flex flex-col gap-1 text-left" dir="ltr">
                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right mr-1">TRIAL EXPIRES</span>
                                <span className="text-xl font-black text-foreground text-right">{new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB')}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div >
    );
};

export default SettingsScreen;
