import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductService } from '../services/ProductService';
import { CategoryService } from '../services/CategoryService';
import { SettingsService } from '../services/SettingsService';
import { Product, ProductInput, Category, SystemSettings } from '../types/models';
import { useStockAlerts } from '../hooks/useStockAlerts';
import { showToast } from '../utils/toast';
import { cn } from '@/lib/utils';
import {
  Search,
  Plus,
  Package,
  BarChart3,
  AlertTriangle,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Image as ImageIcon,
  Printer,
  FileSpreadsheet,
  Upload,
  X
} from 'lucide-react';
import LabelPrintModal from '@/components/printing/LabelPrintModal';
import { ExportService } from '../services/ExportService';

// Shadcn Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [itemsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [printingProduct, setPrintingProduct] = useState<Product | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [formData, setFormData] = useState<ProductInput>({
    name: '',
    barcode: '',
    categoryId: '',
    wholesalePrice: 0,
    retailPrice: 0,
    purchasePrice: 0,
    stockQuantity: 0,
    minStockLevel: 10,
    metadata: {},
  });
  const [skips, setSkips] = useState({
    name: false,
    barcode: false,
    stock: false,
    prices: false
  });
  const [isLoading, setIsLoading] = useState(true);

  // URL search params specific logic
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'add') {
      // Clear param immediately to avoid reopening on refresh
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.delete('action');
        return newParams;
      }, { replace: true });

      // Open modal in "add" mode
      setEditingProduct(null);
      setFormData({
        name: '',
        barcode: '',
        categoryId: categories.length > 0 ? categories[0].id : '',
        wholesalePrice: 0,
        retailPrice: 0,
        purchasePrice: 0,
        stockQuantity: 0,
        minStockLevel: 10,
        metadata: {},
      });
      setSkips({ name: false, barcode: false, stock: false, prices: false });
      setIsModalOpen(true);
    }
  }, [searchParams, setSearchParams, categories]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const productService = useMemo(() => new ProductService(), []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const categoryService = useMemo(() => new CategoryService(), []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const settingsService = useMemo(() => new SettingsService(), []);
  const stockAlerts = useStockAlerts();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const [prodRes, catRes, setRes] = await Promise.all([
      productService.getAllProducts(),
      categoryService.getAllCategories(),
      settingsService.getSettings()
    ]);
    if (prodRes.success) setProducts(prodRes.data);
    if (catRes.success) setCategories(catRes.data);
    if (setRes.success && setRes.data) setSettings(setRes.data);
    setIsLoading(false);
  }, [productService, categoryService, settingsService]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    let filtered = [...products];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.barcode.includes(term)
      );
    }

    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.categoryId === selectedCategory);
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [products, searchTerm, selectedCategory]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit for Base64 storage
        showToast.error('حجم الصورة كبير جداً (الأقصى 1MB)');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          metadata: { ...prev.metadata, imageUrl: reader.result as string }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearImage = () => {
    setFormData(prev => ({
      ...prev,
      metadata: { ...prev.metadata, imageUrl: '' }
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        barcode: product.barcode,
        categoryId: product.categoryId,
        wholesalePrice: product.wholesalePrice,
        retailPrice: product.retailPrice,
        purchasePrice: product.purchasePrice || 0,
        stockQuantity: product.stockQuantity,
        minStockLevel: product.minStockLevel || 10,
        metadata: product.metadata || {},
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        barcode: '',
        categoryId: categories.length > 0 ? categories[0].id : '',
        wholesalePrice: 0,
        retailPrice: 0,
        purchasePrice: 0,
        stockQuantity: 0,
        minStockLevel: 10,
        metadata: {},
      });
      setSkips({ name: false, barcode: false, stock: false, prices: false });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    // 1. Basic Required Fields (Name, Barcode, Category)
    if ((!formData.name && !skips.name) || (!formData.barcode && !skips.barcode) || !formData.categoryId) {
      showToast.error('يرجى ملء البيانات المطلوبة أو اختيار تجاوز (الاسم، الباركود، التصنيف)');
      return;
    }

    // 1b. Barcode Length Validation (5-9 digits)
    if (!skips.barcode && (formData.barcode.length < 5 || formData.barcode.length > 9)) {
      showToast.error('يجب أن يتكون الباركود من 5 إلى 9 أرقام');
      return;
    }

    // 2. Enforce Non-Zero Stock unless bypassed
    if (formData.stockQuantity === 0 && !skips.stock) {
      showToast.error('يرجى إدخال الكمية أو اختيار تجاوز');
      return;
    }

    // 3. Enforce Non-Zero Prices unless bypassed
    const hasZeroPrice = formData.purchasePrice === 0 || formData.wholesalePrice === 0 || formData.retailPrice === 0;
    if (hasZeroPrice && !skips.prices) {
      showToast.error('يرجى إدخال أسعار الشراء والبيع أو اختيار تجاوز');
      return;
    }

    const finalData = { ...formData };
    if (skips.name && !finalData.name) {
      finalData.name = 'منتج جديد ' + new Date().toLocaleTimeString('ar-EG');
    }
    if (skips.barcode && !finalData.barcode) {
      finalData.barcode = 'AUTO-' + Date.now().toString().slice(-8);
    }

    let response;
    if (editingProduct) {
      response = await productService.updateProduct(editingProduct.id, finalData);
    } else {
      response = await productService.createProduct(finalData);
    }

    if (response.success) {
      showToast.success(editingProduct ? 'تم تحديث المنتج بنجاح' : 'تم إضافة المنتج بنجاح');
      setIsModalOpen(false);
      loadData();
      stockAlerts.refresh();
    } else {
      showToast.error(response.error.message);
    }
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;
    const response = await productService.deleteProduct(deletingProduct.id);
    if (response.success) {
      showToast.success('تم حذف المنتج بنجاح');
      setIsDeleteModalOpen(false);
      loadData();
      stockAlerts.refresh();
    } else {
      showToast.error(response.error.message);
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || 'غير محدد';
  };

  const handleExport = async () => {
    if (filteredProducts.length === 0) {
      showToast.error('لا توجد بيانات لتصديرها');
      return;
    }

    const formattedData = ExportService.formatProductsForExport(filteredProducts);
    const result = await ExportService.exportToExcel(
      formattedData,
      `مخزون_جو_كاشير_${new Date().toISOString().split('T')[0]}`,
      'المنتجات'
    );

    if (result.success) {
      showToast.success('تم تصدير ملف الإكسيل بنجاح');
    } else {
      showToast.error('فشل تصدير الملف');
    }
  };

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto bg-app-bg min-h-screen" dir="rtl">

      {/* Header Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-7 flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold w-fit mb-4">
            <Package size={14} />
            <span>المخزون والمنتجات</span>
          </div>
          <h1 className="text-4xl font-black text-foreground mb-2">إدارة المنتجات</h1>
          <p className="text-muted-foreground font-medium">إضافة وتعديل المنتجات، تتبع المخزون، وتنظيم التصنيفات</p>
        </div>

        <div className="md:col-span-5 flex items-center justify-end gap-4">
          <Button
            onClick={() => handleOpenModal()}
            className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-black gap-2 transition-none border-none shadow-lg shadow-primary/20"
          >
            <Plus size={24} />
            إضافة منتج جديد
          </Button>
        </div>
      </div>


      {/* Control Bar */}
      <div className="bg-surface-bg p-5 rounded-3xl border border-border shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="البحث بالاسم أو الباركود..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-12 h-12 rounded-2xl border-border bg-surface-muted focus:bg-surface-bg transition-all text-sm font-medium text-foreground"
          />
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative group w-full md:w-56">
            <Filter className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="h-12 pr-10 rounded-2xl border-border bg-surface-muted font-bold text-foreground">
                <SelectValue placeholder="كل التصنيفات" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                <SelectItem value="all">كل التصنيفات</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={handleExport}
          className="h-12 px-6 rounded-2xl border-border bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 font-bold gap-2 transition-all shrink-0"
        >
          <FileSpreadsheet size={18} />
          تصدير إكسيل
        </Button>
      </div>

      {/* Product Table */}
      <Card className="border-border overflow-hidden rounded-3xl bg-surface-bg shadow-xl shadow-foreground/5">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-surface-muted/50">
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="text-right font-black uppercase tracking-wider text-[10px] text-muted-foreground py-6 pr-8">المنتج</TableHead>
                <TableHead className="text-right font-black uppercase tracking-wider text-[10px] text-muted-foreground py-6">الباركود</TableHead>
                <TableHead className="text-right font-black uppercase tracking-wider text-[10px] text-muted-foreground py-6">التصنيف</TableHead>
                <TableHead className="text-right font-black uppercase tracking-wider text-[10px] text-muted-foreground py-6">الأسعار (جمله/قطاعي)</TableHead>
                <TableHead className="text-right font-black uppercase tracking-wider text-[10px] text-muted-foreground py-6">المخزون</TableHead>
                <TableHead className="text-left font-black uppercase tracking-wider text-[10px] text-muted-foreground py-6 pl-8">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell colSpan={6} className="py-8"><div className="h-4 bg-slate-100 rounded-full w-full"></div></TableCell>
                  </TableRow>
                ))
              ) : paginatedProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-4 text-slate-300">
                      <Package size={48} strokeWidth={1} className="text-muted-foreground/30" />
                      <p className="font-bold text-foreground/40">لا يوجد منتجات مطابقة للبحث</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedProducts.map((product) => {
                  const isLowStock = (product.stockQuantity ?? 0) <= (product.minStockLevel || 10);
                  const isOutOfStock = (product.stockQuantity ?? 0) <= 0;

                  return (
                    <TableRow key={product.id} className="group border-border hover:bg-surface-muted/50 transition-colors">
                      <TableCell className="py-5 pr-8">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-surface-muted flex items-center justify-center text-muted-foreground shrink-0 overflow-hidden">
                            {product.metadata?.imageUrl ? (
                              <img src={product.metadata.imageUrl} alt="" className="h-full w-full object-cover" />
                            ) : <ImageIcon size={20} />}
                          </div>
                          <div>
                            <div className="font-black text-foreground mb-0.5">{product.name}</div>
                            {product.metadata?.description && <div className="text-[10px] text-slate-400 truncate max-w-[200px]">{product.metadata.description}</div>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-500">{product.barcode}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="rounded-full bg-surface-muted text-foreground/70 border-border py-0.5 px-3 font-bold text-[10px]">
                          {product.categoryName || getCategoryName(product.categoryId)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-xs font-bold text-foreground">{product.retailPrice.toFixed(2)} <span className="text-[8px] text-muted-foreground">{settings?.pricingOpts?.tier1Name || 'قطاعي'}</span></div>
                          {settings?.pricingOpts?.showTier2 !== false && (
                            <div className="text-[10px] font-medium text-slate-400">{product.wholesalePrice.toFixed(2)} <span className="text-[8px]">{settings?.pricingOpts?.tier2Name || 'جملة'}</span></div>
                          )}
                          {(settings?.pricingOpts?.customTiers || []).map(t => (
                            <div key={t.id} className="text-[10px] font-medium text-indigo-400">{Number(product.metadata?.customPrices?.[t.id] || 0).toFixed(2)} <span className="text-[8px]">{t.name}</span></div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "h-10 px-3 rounded-xl flex items-center justify-center font-black text-sm border",
                            isOutOfStock ? "bg-red-50 text-red-600 border-red-100" :
                              isLowStock ? "bg-orange-50 text-orange-600 border-orange-100" :
                                "bg-emerald-50 text-emerald-600 border-emerald-100"
                          )}>
                            {product.stockQuantity ?? 0}
                          </div>
                          {isLowStock && <AlertTriangle size={14} className="text-orange-500 animate-pulse" />}
                        </div>
                      </TableCell>
                      <TableCell className="pl-8">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0 rounded-xl hover:bg-slate-200"
                            onClick={() => {
                              setPrintingProduct(product);
                              setIsPrintModalOpen(true);
                            }}
                            title="طباعة باركود"
                          >
                            <Printer size={16} className="text-muted-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0 rounded-xl hover:bg-slate-200"
                            onClick={() => handleOpenModal(product)}
                          >
                            <Edit size={16} className="text-muted-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0 rounded-xl hover:bg-red-50 hover:text-red-600"
                            onClick={() => {
                              setDeletingProduct(product);
                              setIsDeleteModalOpen(true);
                            }}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
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
          <div className="p-6 border-t border-border flex items-center justify-between bg-surface-bg">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              عرض <span className="text-foreground">{paginatedProducts.length}</span> من <span className="text-foreground">{filteredProducts.length}</span> منتج
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-10 px-4 rounded-xl border-border text-foreground"
              >
                السابق
                <ChevronRight size={18} className="ml-1" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-10 px-4 rounded-xl border-border text-foreground"
              >
                التالي
                <ChevronLeft size={18} className="mr-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Add/Edit Product Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl rounded-[32px] border-none p-0 overflow-hidden bg-surface-bg shadow-2xl">
          <div className="bg-surface-bg flex flex-col max-h-[90vh]">
            <DialogHeader className="bg-slate-950 p-8 text-white">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-xl">
                  {editingProduct ? <Edit size={24} /> : <Plus size={24} />}
                </div>
                <DialogTitle className="text-3xl font-black">{editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}</DialogTitle>
              </div>
              <DialogDescription className="text-indigo-100 opacity-80">أدخل تفاصيل المنتج بدقة لضمان دقة التقارير والمخزون</DialogDescription>
            </DialogHeader>

            <div className="p-8 space-y-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between pr-1">
                    <Label className="font-bold text-foreground/80">اسم المنتج</Label>
                    <div className="flex items-center gap-1.5 cursor-pointer group" onClick={() => setSkips({ ...skips, name: !skips.name })}>
                      <Checkbox checked={skips.name} onCheckedChange={(checked) => setSkips({ ...skips, name: !!checked })} id="skip-name" className="w-3.5 h-3.5" />
                      <Label htmlFor="skip-name" className="text-[10px] font-bold text-muted-foreground cursor-pointer group-hover:text-primary transition-colors">تجاوز</Label>
                    </div>
                  </div>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={skips.name}
                    className={cn("h-12 rounded-xl bg-surface-muted border-border text-foreground transition-opacity", skips.name && "opacity-50")}
                    placeholder={skips.name ? "تجاوز التسمية..." : "مثال: تيشرت قطن"}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between pr-1">
                    <Label className="font-bold text-foreground/80">الباركود</Label>
                    <div className="flex items-center gap-1.5 cursor-pointer group" onClick={() => setSkips({ ...skips, barcode: !skips.barcode })}>
                      <Checkbox checked={skips.barcode} onCheckedChange={(checked) => setSkips({ ...skips, barcode: !!checked })} id="skip-barcode" className="w-3.5 h-3.5" />
                      <Label htmlFor="skip-barcode" className="text-[10px] font-bold text-muted-foreground cursor-pointer group-hover:text-primary transition-colors">تجاوز</Label>
                    </div>
                  </div>
                  <Input
                    value={formData.barcode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 9);
                      setFormData({ ...formData, barcode: val });
                    }}
                    maxLength={9}
                    disabled={skips.barcode}
                    className={cn("h-12 rounded-xl bg-surface-muted border-border text-foreground transition-opacity", skips.barcode && "opacity-50")}
                    placeholder={skips.barcode ? "توليد تلقائي..." : "000000000"}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-foreground/80 pr-1">التصنيف</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(val) => setFormData({ ...formData, categoryId: val })}
                  >
                    <SelectTrigger className="h-12 rounded-xl bg-surface-muted border-border text-foreground">
                      <SelectValue placeholder="اختر التصنيف" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl bg-surface-bg border-border">
                      {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-foreground/80 pr-1">الحد الأدنى للتنبيه</Label>
                  <Input
                    type="number"
                    value={formData.minStockLevel}
                    onChange={(e) => setFormData({ ...formData, minStockLevel: parseInt(e.target.value) || 0 })}
                    className="h-12 rounded-xl bg-surface-muted border-border text-foreground"
                  />
                </div>
              </div>

              <div className="bg-surface-muted/50 p-6 rounded-2xl border border-border shadow-sm space-y-6">
                <h4 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                  <BarChart3 size={16} className="text-secondary" />
                  الكمية والأسعار
                  <div className="mr-auto flex items-center gap-1.5 cursor-pointer group" onClick={() => setSkips({ ...skips, prices: !skips.prices, stock: !skips.stock })}>
                    <Checkbox
                      checked={skips.prices && skips.stock}
                      onCheckedChange={(checked) => setSkips({ ...skips, prices: !!checked, stock: !!checked })}
                      id="skip-all-values"
                      className="w-3.5 h-3.5"
                    />
                    <Label htmlFor="skip-all-values" className="text-[10px] font-bold text-muted-foreground cursor-pointer group-hover:text-primary transition-colors">تجاوز الكل</Label>
                  </div>
                </h4>
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground pr-1">سعر الشراء</Label>
                    <Input
                      type="number"
                      value={formData.purchasePrice}
                      onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
                      disabled={skips.prices}
                      className={cn("font-black text-center h-12 rounded-xl border-border bg-surface-bg text-foreground transition-opacity", skips.prices && "opacity-50")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground pr-1">الكمية الحالية</Label>
                    <Input
                      type="number"
                      value={formData.stockQuantity}
                      onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })}
                      disabled={skips.stock}
                      className={cn("font-black text-center h-12 rounded-xl border-border bg-surface-bg text-foreground transition-opacity", skips.stock && "opacity-50")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground pr-1">سعر {settings?.pricingOpts?.tier2Name || 'جملة'}</Label>
                    <Input
                      type="number"
                      value={formData.wholesalePrice}
                      onChange={(e) => setFormData({ ...formData, wholesalePrice: parseFloat(e.target.value) || 0 })}
                      disabled={skips.prices}
                      className={cn("font-black text-center h-12 rounded-xl border-border bg-surface-bg text-foreground transition-opacity", skips.prices && "opacity-50")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground pr-1">سعر {settings?.pricingOpts?.tier1Name || 'قطاعي'}</Label>
                    <Input
                      type="number"
                      value={formData.retailPrice}
                      onChange={(e) => setFormData({ ...formData, retailPrice: parseFloat(e.target.value) || 0 })}
                      disabled={skips.prices}
                      className={cn("font-black text-center h-12 rounded-xl border-border bg-secondary/10 text-foreground transition-opacity", skips.prices && "opacity-50")}
                    />
                  </div>
                  {(settings?.pricingOpts?.customTiers || []).map(t => (
                    <div key={t.id} className="space-y-2">
                      <Label className="text-xs font-bold text-muted-foreground pr-1">سعر {t.name}</Label>
                      <Input
                        type="number"
                        value={formData.metadata?.customPrices?.[t.id] || ''}
                        onChange={(e) => setFormData(f => ({ ...f, metadata: { ...f.metadata, customPrices: { ...(f.metadata?.customPrices || {}), [t.id]: parseFloat(e.target.value) || 0 } } }))}
                        disabled={skips.prices}
                        className={cn("font-black text-center h-12 rounded-xl border-border bg-surface-bg text-foreground transition-opacity", skips.prices && "opacity-50")}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                  <ImageIcon size={16} className="text-secondary" />
                  معلومات إضافية
                </h4>
                <div className="space-y-4">
                  <Label className="text-xs font-bold text-muted-foreground pr-1">صورة المنتج</Label>
                  <div className="flex items-center gap-6">
                    <div className="h-32 w-32 rounded-3xl bg-surface-muted border-2 border-dashed border-border flex items-center justify-center text-muted-foreground overflow-hidden relative group">
                      {formData.metadata?.imageUrl ? (
                        <>
                          <img src={formData.metadata.imageUrl} alt="" className="h-full w-full object-cover" />
                          <button
                            onClick={handleClearImage}
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                          >
                            <X size={24} />
                          </button>
                        </>
                      ) : (
                        <ImageIcon size={32} className="opacity-20" />
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        accept="image/*"
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="h-10 rounded-xl border-border px-4 font-bold flex items-center gap-2"
                      >
                        <Upload size={16} />
                        اختر صورة
                      </Button>
                      <p className="text-[10px] text-muted-foreground max-w-[150px]">يفضل استخدام صور مربعة (PNG/JPG) بحد أقصى 1MB</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground pr-1">الوصف</Label>
                  <textarea
                    value={formData.metadata?.description || ''}
                    onChange={(e) => setFormData({ ...formData, metadata: { ...formData.metadata, description: e.target.value } })}
                    className="w-full min-h-[100px] p-4 rounded-xl border border-border bg-surface-muted focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium text-foreground"
                    placeholder="اكتب وصفاً مختصراً للمنتج..."
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="p-8 pt-0 flex gap-4 bg-transparent border-none">
              <Button onClick={handleSubmit} className="flex-1 h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-lg shadow-lg shadow-primary/20 border-none">
                {editingProduct ? 'حفظ التعديلات' : 'إضافة المنتج'}
              </Button>
              <Button variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1 h-14 rounded-2xl border-border font-bold text-foreground">إلغاء</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md rounded-[32px] border-none p-8 text-center space-y-6 bg-surface-bg shadow-2xl">
          <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle size={40} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-foreground mb-2">تأكيد الحذف</h3>
            <p className="text-muted-foreground font-medium">
              هل أنت متأكد من حذف المنتج <span className="text-rose-500 font-black">"{deletingProduct?.name}"</span>؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="destructive" onClick={handleDelete} className="flex-1 h-12 rounded-xl font-black bg-rose-600 hover:bg-rose-700">حذف نهائياً</Button>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} className="flex-1 h-12 rounded-xl font-bold border-border text-foreground">تراجع</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Print Label Modal */}
      <LabelPrintModal
        product={printingProduct}
        isOpen={isPrintModalOpen}
        onOpenChange={setIsPrintModalOpen}
      />

    </div>
  );
};

export default ProductManagement;
