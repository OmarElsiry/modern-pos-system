import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

import { CustomerSelect, Numpad, EmptyState } from '../components';
import ReceiptPreview from '../components/ReceiptPreview';
import { SalesService } from '../services/SalesService';
import { Invoice, PricingType, Product, Customer } from '../types/models';
import { showToast } from '../utils/toast';
import { useProductSearch } from '../hooks/useProductSearch';
import { useTransaction } from '../hooks/useTransaction';
import { useBarcodeScanner } from '../hooks/useBarcodeScanner';
import { cn } from '@/lib/utils';

// Shadcn Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, ShoppingCart, Plus, Minus, Trash2, MoreVertical, ShoppingBag, CreditCard, Ban } from 'lucide-react';

const POSScreen: React.FC = () => {
  // --- Refs & Services ---
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const salesService = useMemo(() => new SalesService(), []);

  const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchStart = useRef<number | null>(null);

  // --- Hooks ---
  const transaction = useTransaction(salesService);
  const searchHook = useProductSearch();

  // --- States ---
  const [error, setError] = useState<string>('');
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showReceiptPreview, setShowReceiptPreview] = useState(false);
  const [completedInvoice, setCompletedInvoice] = useState<Invoice | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isNumpadOpen, setIsNumpadOpen] = useState(false);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [isMobileSettingsOpen, setIsMobileSettingsOpen] = useState(false);
  const [swipeTranslation, setSwipeTranslation] = useState<{ [key: string]: number }>({});
  const [numpadBuffer, setNumpadBuffer] = useState<string>('');
  const [undoItem, setUndoItem] = useState<{ id: string; product: Product; quantity: number } | null>(null);

  // --- Business Logic Handlers ---
  const handlePricingTypeChange = useCallback(async (type: PricingType) => {
    await transaction.setPricingType(type);
    showToast.success(`تم تغيير نوع التسعير إلى ${type === 'wholesale' ? 'جملة' : 'قطاعي'}`);
  }, [transaction]);

  const handleCustomerSelect = useCallback((customer: Customer | null) => {
    transaction.setCustomer(customer?.id || null);
    setSelectedCustomer(customer);
  }, [transaction]);

  const handleBarcodeScanned = useCallback(async (scannedBarcode: string) => {
    setError('');
    const success = await transaction.addProduct(scannedBarcode);
    if (success) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      showToast.success('تم إضافة المنتج بنجاح');
    }
  }, [transaction]);

  // Use the Barcode Scanner Hook
  useBarcodeScanner({
    onScan: handleBarcodeScanned,
    minLength: 3,
  });

  const handleQuantityChange = useCallback(async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) return;
    await transaction.updateQuantity(itemId, newQuantity);
  }, [transaction]);

  const handleUndoRemove = useCallback(async () => {
    if (!undoItem) return;
    const success = await transaction.addProduct(undoItem.product.id);
    if (success) {
      transaction.updateQuantity(undoItem.id, undoItem.quantity);
      setUndoItem(null);
      if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
      showToast.success('تم التراجع عن الحذف');
    }
  }, [undoItem, transaction]);

  const handleRemoveItem = useCallback((itemId: string) => {
    const itemToRemove = transaction.invoice?.items.find(i => i.id === itemId);
    transaction.removeItem(itemId);

    setSwipeTranslation(prev => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });

    if (itemToRemove) {
      const product: Product = {
        id: itemToRemove.productId,
        barcode: '',
        name: itemToRemove.productName,
        categoryId: '',
        wholesalePrice: itemToRemove.unitPrice,
        retailPrice: itemToRemove.unitPrice,
        purchasePrice: itemToRemove.purchasePrice || 0,
        stockQuantity: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setUndoItem({ id: itemId, product, quantity: itemToRemove.quantity });
      if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
      undoTimeoutRef.current = setTimeout(() => setUndoItem(null), 5000);

      showToast.success('تم حذف المنتج', {
        duration: 5000,
        action: {
          label: 'تراجع',
          onClick: () => handleUndoRemove()
        }
      });
    }
  }, [transaction, handleUndoRemove]);

  const handleProductSelect = useCallback((product: Product) => {
    handleBarcodeScanned(product.barcode);
  }, [handleBarcodeScanned]);

  const handleNumpadInput = useCallback((val: string) => {
    if (!activeItemId) return;

    setNumpadBuffer(prev => {
      let next = prev;
      if (val === '.') {
        if (!next.includes('.')) next = next === '' ? '0.' : next + '.';
      } else if (val === '00') {
        if (next === '' || next === '0') next = '0';
        else next += '00';
      } else {
        if (next === '0') next = val;
        else next += val;
      }

      const qty = parseFloat(next);

      // Enforce stock limit
      const item = transaction.invoice?.items.find(i => i.id === activeItemId);
      if (item) {
        const product = searchHook.results.find(p => p.id === item.productId);
        if (product && qty > product.stockQuantity) {
          showToast.error(`لا يمكن تجاوز المخزن المتاح (${product.stockQuantity})`);
          return prev;
        }
      }

      if (!isNaN(qty)) handleQuantityChange(activeItemId, qty);
      return next;
    });
  }, [activeItemId, handleQuantityChange]);

  const handleNumpadBackspace = useCallback(() => {
    if (!activeItemId) return;
    setNumpadBuffer(prev => {
      const next = prev.slice(0, -1);
      const qty = next === '' || next === '-' ? 0 : parseFloat(next);
      handleQuantityChange(activeItemId, qty);
      return next;
    });
  }, [activeItemId, handleQuantityChange]);

  const handleNumpadClear = useCallback(() => {
    if (!activeItemId) return;
    setNumpadBuffer('');
    handleQuantityChange(activeItemId, 1);
  }, [activeItemId, handleQuantityChange]);

  const handleCompleteInvoice = async () => {
    setError('');
    const result = await transaction.complete();
    if (result) {
      showToast.success('تم إتمام الفاتورة بنجاح! رقم الفاتورة: ' + result.invoiceNumber, 5000);
      setIsCompleteModalOpen(false);

      const savedInvoice = await window.electronAPI.invoices.getById(result.id || '');
      if (savedInvoice) {
        setCompletedInvoice(savedInvoice);

        // Refresh product list immediately to update stock alerts
        searchHook.refresh();

        setShowReceiptPreview(true);
      }
    } else {
      showToast.error('فشل إتمام الفاتورة');
    }
  };

  const handleCancelInvoice = () => {
    transaction.clear();
    showToast.success('تم إلغاء الفاتورة');
    setIsCancelModalOpen(false);
  };

  // --- Touch Handlers (Swipe to Delete) ---
  const handleTouchStart = (e: React.TouchEvent, _itemId: string) => {
    touchStart.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent, itemId: string) => {
    if (touchStart.current === null) return;
    const currentTouch = e.touches[0].clientX;
    const diff = currentTouch - touchStart.current;

    if (diff < 0 && diff > -100) {
      setSwipeTranslation(prev => ({ ...prev, [itemId]: diff }));
    }
  };

  const handleTouchEnd = (_e: React.TouchEvent, itemId: string) => {
    const finalDiff = swipeTranslation[itemId] || 0;
    if (finalDiff < -70) {
      handleRemoveItem(itemId);
    } else {
      setSwipeTranslation(prev => ({ ...prev, [itemId]: 0 }));
    }
    touchStart.current = null;
  };

  // --- Effects ---
  useEffect(() => {
    if (!transaction.isLoading && !transaction.invoice) {
      transaction.setPricingType('wholesale');
    }
  }, [transaction.isLoading, transaction.invoice]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F3') {
        e.preventDefault();
        document.getElementById('product-search-input')?.focus();
      }
      if (e.key === 'F1' && (transaction.invoice?.items.length ?? 0) > 0) {
        e.preventDefault();
        setIsCompleteModalOpen(true);
      }
      if (e.key === 'Escape') {
        if (isCompleteModalOpen) setIsCompleteModalOpen(false);
        if (isNumpadOpen) setIsNumpadOpen(false);
      }
      if (e.key === 'F9') {
        e.preventDefault();
        handlePricingTypeChange(transaction.invoice?.pricingType === 'wholesale' ? 'retail' : 'wholesale');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [transaction.invoice, isCompleteModalOpen, isNumpadOpen, handlePricingTypeChange]);

  // Numpad Keyboard support
  useEffect(() => {
    if (!isNumpadOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleNumpadInput(e.key);
      } else if (e.key === '.') {
        handleNumpadInput('.');
      } else if (e.key === 'Backspace') {
        handleNumpadBackspace();
      } else if (e.key === 'Enter') {
        setIsNumpadOpen(false);
      } else if (e.key === 'c' || e.key === 'C') {
        handleNumpadClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isNumpadOpen, handleNumpadInput, handleNumpadBackspace, handleNumpadClear]);

  // Memoized values
  const hasItems = useMemo(() => (transaction.invoice?.items.length ?? 0) > 0, [transaction.invoice?.items.length]);

  if (!transaction.invoice) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
        <p className="text-slate-500 font-medium">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-4 h-[calc(100vh-80px)] p-4 bg-app-bg overflow-hidden relative pos-screen" dir="rtl">

      {/* --- Left Column: Product Selection --- */}
      <div className="flex flex-col gap-4 overflow-hidden h-full">
        <div className="flex gap-4 p-3 bg-surface-bg rounded-2xl border border-border shadow-sm items-center">
          <div className="relative flex-1">
            <Search className="absolute right-4 top-3 h-5 w-5 text-slate-400" />
            <Input
              id="product-search-input"
              className={cn(
                "pr-12 h-11 rounded-xl border-slate-200 focus:border-slate-400 outline-none text-lg",
                showSuccess && "border-emerald-500 ring-emerald-500"
              )}
              placeholder="ابحث بالاسم أو الباركود... (F3)"
              value={searchHook.query}
              onChange={(e) => searchHook.setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleBarcodeScanned(searchHook.query);
              }}
              autoFocus
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-11 w-11 rounded-xl"
            onClick={() => setIsMobileSettingsOpen(!isMobileSettingsOpen)}
          >
            <MoreVertical className="h-6 w-6" />
          </Button>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-1 content-start overflow-y-auto p-1 flex-1">
          {searchHook.loading ? (
            <div className="col-span-full flex flex-col items-center justify-center p-12 text-muted-foreground gap-3">
              <div className="flex space-x-4">
                <div className="rounded-full bg-surface-muted h-10 w-10"></div>
              </div>
              <span>جاري البحث عن المنتجات...</span>
            </div>
          ) : searchHook.results.length > 0 ? (
            searchHook.results.map(product => (
              <Card
                key={product.id}
                className="group cursor-pointer border-border hover:border-primary/50 flex flex-col overflow-hidden rounded-2xl bg-surface-bg shadow-sm product-card transition-all h-fit"
                onClick={() => handleProductSelect(product)}
              >
                <CardContent className="p-0 flex flex-col h-full">
                  <div className="w-full h-14 bg-surface-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary transition-colors overflow-hidden">
                    {product.metadata?.imageUrl ? (
                      <img src={product.metadata.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingBag className="h-5 w-5" />
                    )}
                  </div>
                  <div className="p-1 flex-1 flex flex-col gap-0.5">
                    <h3 className="font-bold text-foreground text-[11px] line-clamp-1 leading-tight">{product.name}</h3>
                    <div className="flex justify-between items-end">
                      <div className="text-lg font-black text-foreground leading-none">
                        {(transaction.invoice!.pricingType === 'wholesale' ? product.wholesalePrice : product.retailPrice).toFixed(0)} <span className="text-[10px] font-bold text-muted-foreground">ج.م</span>
                      </div>
                      {product.stockQuantity <= 5 && (
                        <span className="text-[10px] bg-red-50 text-red-600 font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">
                          نقص: {product.stockQuantity}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full h-full flex items-center justify-center">
              <EmptyState title="ابدأ البحث عن منتجات لإضافتها" />
            </div>
          )}
        </div>
      </div>

      {/* --- Right Column: Cart Section --- */}
      <div className={cn(
        "flex flex-col h-full bg-surface-bg border border-border rounded-3xl overflow-hidden relative z-10 lg:translate-y-0",
        isMobileSettingsOpen ? "translate-y-0 fixed inset-0 z-50 rounded-none h-full" : "translate-y-[calc(100%-80px)] lg:relative max-lg:fixed max-lg:bottom-0 max-lg:left-0 max-lg:right-0 max-lg:h-[80vh] max-lg:rounded-t-[40px]"
      )}>

        {/* Mobile Header */}
        <div className="lg:hidden p-4 border-b flex justify-between items-center bg-surface-muted">
          <Button variant="ghost" onClick={() => setIsMobileSettingsOpen(false)}><Ban size={20} /></Button>
          <div className="font-bold">سلة المشتريات</div>
          <Button variant="ghost" onClick={handleCancelInvoice} className="text-red-500"><Trash2 size={20} /></Button>
        </div>

        <div className="p-4 border-b flex flex-col gap-4 bg-surface-muted/30">
          <div className="flex items-center bg-surface-muted rounded-xl p-1 h-12 shadow-inner">
            <button
              className={cn("flex-1 flex items-center justify-center text-sm font-bold rounded-lg h-full transition-all", transaction.invoice!.pricingType === 'wholesale' ? "bg-surface-bg text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground")}
              onClick={() => handlePricingTypeChange('wholesale')}
            >
              جملة
            </button>
            <button
              className={cn("flex-1 flex items-center justify-center text-sm font-bold rounded-lg h-full transition-all", transaction.invoice!.pricingType === 'retail' ? "bg-surface-bg text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground")}
              onClick={() => handlePricingTypeChange('retail')}
            >
              قطاعي
            </button>
          </div>

          <CustomerSelect
            selectedCustomerId={transaction.selectedCustomerId || undefined}
            onSelect={handleCustomerSelect}
          />
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1.5">
          {!hasItems ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground/30 gap-6">
              <ShoppingCart className="h-20 w-20 stroke-[1]" />
              <p className="font-bold text-lg">السلة فارغة</p>
            </div>
          ) : (
            transaction.invoice!.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 bg-surface-bg rounded-2xl border border-border/50 shadow-sm group hover:border-primary/50 cart-item transition-all"
                onTouchStart={(e) => handleTouchStart(e, item.id)}
                onTouchMove={(e) => handleTouchMove(e, item.id)}
                onTouchEnd={(e) => handleTouchEnd(e, item.id)}
                style={{
                  transform: `translateX(${swipeTranslation[item.id] || 0}px)`,
                  transition: 'none'
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-foreground text-sm truncate uppercase tracking-tight">{item.productName}</div>
                  <div className="text-xs font-black text-muted-foreground mt-0.5">{item.unitPrice.toFixed(2)} ج.م</div>
                </div>

                <div className="flex flex-col items-end gap-2 min-w-[120px]">
                  {/* Quantity Counter (Above Price) */}
                  <div className="flex items-center gap-1 bg-surface-muted rounded-xl p-0.5 border border-border shadow-inner scale-90 origin-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg hover:bg-surface-bg text-foreground"
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </Button>
                    <button
                      className="w-8 text-center font-black text-xs text-foreground"
                      onClick={() => {
                        setActiveItemId(item.id);
                        setNumpadBuffer('0');
                        setIsNumpadOpen(true);
                      }}
                    >
                      {item.quantity}
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg hover:bg-surface-bg text-foreground hover:shadow-sm transition-all"
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      disabled={item.quantity >= (searchHook.results.find(p => p.id === item.productId)?.stockQuantity || 999999)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  {/* Price Breakdown and Total */}
                  <div className="flex flex-col items-end leading-tight">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">
                      {item.quantity} × {item.unitPrice.toFixed(2)}
                    </div>
                    <div className="font-black text-foreground text-sm">
                      {item.totalPrice.toFixed(0)} <span className="text-[10px] text-muted-foreground">ج.م</span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-muted-foreground/30 hover:text-red-500 hover:bg-red-500/10 rounded-lg lg:opacity-0 group-hover:opacity-100 transition-all"
                  onClick={() => handleRemoveItem(item.id)}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Footer with Totals */}
        <div className="mt-auto pt-6 p-4 bg-slate-950 text-white rounded-t-[32px] space-y-4 shadow-[0_-8px_30px_rgb(0,0,0,0.1)]">
          {/* Current Invoice */}
          <div className="space-y-1 px-2">
            <div className="flex justify-between items-center text-slate-400 text-xs font-bold uppercase tracking-widest">
              <span>عدد الأصناف</span>
              <span className="text-white bg-white/10 px-2 py-0.5 rounded-full">{transaction.invoice!.items.length}</span>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-white/10">
              <span className="text-lg font-bold text-slate-300">الإجمالي</span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black tracking-tight text-white">{transaction.invoice.totalAmount.toFixed(0)}</span>
                <span className="text-sm font-bold text-slate-400">جنية</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              variant="default"
              className="flex-1 h-12 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 text-xl font-black"
              onClick={() => setIsCompleteModalOpen(true)}
              disabled={!hasItems}
            >
              <CreditCard size={22} className="ml-2" />
              إتمام البيع
            </Button>
            <Button
              variant="ghost"
              className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-red-500 transition-colors"
              onClick={() => setIsCancelModalOpen(true)}
              disabled={!hasItems}
            >
              <Trash2 size={24} />
            </Button>
          </div>
        </div>
      </div>

      {/* --- Modals (Dialogs) --- */}
      <Dialog open={isCompleteModalOpen} onOpenChange={setIsCompleteModalOpen}>
        <DialogContent className="rounded-3xl border-none p-0 overflow-hidden bg-surface-bg shadow-2xl">
          <div className="bg-slate-950 p-8 text-white">
            <DialogTitle className="text-2xl font-black mb-2">تأكيد العملية</DialogTitle>
            <DialogDescription className="text-slate-400">سيتم إتمام البيع وعرض خيارات الطباعة والتحميل.</DialogDescription>
          </div>

          <div className="p-8 space-y-6">
            {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100">{error}</div>}

            <div className="space-y-4">
              <div className="flex justify-between items-center bg-surface-muted p-4 rounded-2xl">
                <span className="text-muted-foreground font-bold uppercase text-xs">نوع السعر</span>
                <span className="font-black text-foreground">{transaction.invoice?.pricingType === 'wholesale' ? 'سعر جملة' : 'سعر قطاعي'}</span>
              </div>
              <div className="flex justify-between items-center py-4 px-2 border-b border-border">
                <span className="text-muted-foreground font-bold">مجموع الفاتورة</span>
                <span className="text-3xl font-black text-foreground">{transaction.invoice?.totalAmount.toFixed(2)} ج.م</span>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1 h-12 rounded-xl border-border font-bold bg-transparent"
                onClick={() => setIsCompleteModalOpen(false)}
              >
                تراجع
              </Button>
              <Button
                className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 font-bold text-primary-foreground"
                onClick={handleCompleteInvoice}
              >
                تأكيد وإتمام العملية
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">إلغاء الفاتورة؟</DialogTitle>
            <DialogDescription className="py-4">
              هل أنت متأكد من مسح جميع محتويات السلة والبدء من جديد؟
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-3">
            <Button variant="ghost" onClick={() => setIsCancelModalOpen(false)} className="font-bold">لا، العودة</Button>
            <Button variant="destructive" onClick={handleCancelInvoice} className="font-bold rounded-xl px-8">نعم، مسح الكل</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- Other Components --- */}
      {showReceiptPreview && completedInvoice && (
        <ReceiptPreview
          invoice={completedInvoice}
          items={completedInvoice.items}
          customer={selectedCustomer || undefined}
          onClose={() => {
            setShowReceiptPreview(false);
            setCompletedInvoice(null);
          }}
        />
      )}

      {isNumpadOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/10"
          onClick={() => setIsNumpadOpen(false)}
        />
      )}

      <Numpad
        isOpen={isNumpadOpen}
        onClose={() => setIsNumpadOpen(false)}
        onInput={handleNumpadInput}
        onClear={handleNumpadClear}
        onBackspace={handleNumpadBackspace}
        onConfirm={() => setIsNumpadOpen(false)}
        itemName={transaction.invoice?.items.find(i => i.id === activeItemId)?.productName}
        itemPrice={transaction.invoice?.items.find(i => i.id === activeItemId)?.unitPrice}
        currentQuantity={numpadBuffer}
        maxStock={searchHook.results.find(p => p.id === transaction.invoice?.items.find(i => i.id === activeItemId)?.productId)?.stockQuantity}
      />

      {/* Hidden container for printing removed as we use PDF download now */}
    </div>
  );
};

export default POSScreen;
