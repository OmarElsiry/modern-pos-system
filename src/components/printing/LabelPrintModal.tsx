import React, { useState, useRef, useEffect } from 'react';
import { Product } from '@/types/models';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Printer, Plus } from 'lucide-react';
import BarcodeLabel from './BarcodeLabel';
import { showToast } from '@/utils/toast';
import JsBarcode from 'jsbarcode';

interface LabelPrintModalProps {
    product: Product | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

type LabelSize = '48x24' | '40x27' | '44x27' | '38x25' | '50x30' | '40x20' | '44x26' | '55x40' | '40x26' | '40x30' | 'custom';

const SIZE_DIMENSIONS: Record<LabelSize, { width: number; height: number; name: string }> = {
    '48x24': { width: 48, height: 24, name: 'مخصص (48x24 مم)' },
    '40x27': { width: 40, height: 27, name: 'مخصص (40x27 مم)' },
    '44x27': { width: 44, height: 27, name: 'مخصص (44x27 مم)' },
    '40x30': { width: 40, height: 30, name: 'افتراضي (40x30 مم)' },
    '38x25': { width: 38, height: 25, name: 'صغير (38x25 مم)' },
    '50x30': { width: 50, height: 30, name: 'وسط (50x30 مم)' },
    '40x20': { width: 40, height: 20, name: 'ضيق (40x20 مم)' },
    '44x26': { width: 44, height: 26, name: 'مخصص (44x26 مم)' },
    '55x40': { width: 55, height: 40, name: 'كبير (55x40 مم)' },
    '40x26': { width: 40, height: 26, name: 'وسط (40x26 مم)' },
    'custom': { width: 0, height: 0, name: 'مخصص (أبعاد يدوية)' },
};

const LabelPrintModal: React.FC<LabelPrintModalProps> = ({
    product,
    isOpen,
    onOpenChange,
}) => {
    const [quantity, setQuantity] = useState(1);
    const [size, setSize] = useState<LabelSize>(() => (localStorage.getItem('joe-print-label-size') as LabelSize) || '40x30');
    const [customWidth, setCustomWidth] = useState(() => parseInt(localStorage.getItem('joe-print-label-customWidth') || '50'));
    const [customHeight, setCustomHeight] = useState(() => parseInt(localStorage.getItem('joe-print-label-customHeight') || '30'));
    const [showName, setShowName] = useState(() => localStorage.getItem('joe-print-label-showName') !== 'false');
    const [showRetailPrice, setShowRetailPrice] = useState(() => localStorage.getItem('joe-print-label-showRetailPrice') !== 'false');
    const [showWholesalePrice, setShowWholesalePrice] = useState(() => localStorage.getItem('joe-print-label-showWholesalePrice') !== 'false');
    const [showBarcodeText, setShowBarcodeText] = useState(() => localStorage.getItem('joe-print-label-showBarcodeText') !== 'false');
    const [rotate, setRotate] = useState(() => localStorage.getItem('joe-print-label-rotate') === 'true');
    const [barcodeWidthScale, setBarcodeWidthScale] = useState(() => parseFloat(localStorage.getItem('joe-print-label-barcodeWidthScale') || '1'));
    const [barcodeHeight, setBarcodeHeight] = useState(() => parseInt(localStorage.getItem('joe-print-label-barcodeHeight') || '60'));
    const [nameFontSize, setNameFontSize] = useState(() => parseInt(localStorage.getItem('joe-print-label-nameFontSize') || '11'));

    // Persistence observers
    useEffect(() => { localStorage.setItem('joe-print-label-size', size); }, [size]);
    useEffect(() => { localStorage.setItem('joe-print-label-customWidth', customWidth.toString()); }, [customWidth]);
    useEffect(() => { localStorage.setItem('joe-print-label-customHeight', customHeight.toString()); }, [customHeight]);
    useEffect(() => { localStorage.setItem('joe-print-label-showName', showName.toString()); }, [showName]);
    useEffect(() => { localStorage.setItem('joe-print-label-showRetailPrice', showRetailPrice.toString()); }, [showRetailPrice]);
    useEffect(() => { localStorage.setItem('joe-print-label-showWholesalePrice', showWholesalePrice.toString()); }, [showWholesalePrice]);
    useEffect(() => { localStorage.setItem('joe-print-label-showBarcodeText', showBarcodeText.toString()); }, [showBarcodeText]);
    useEffect(() => { localStorage.setItem('joe-print-label-rotate', rotate.toString()); }, [rotate]);
    useEffect(() => { localStorage.setItem('joe-print-label-barcodeWidthScale', barcodeWidthScale.toString()); }, [barcodeWidthScale]);
    useEffect(() => { localStorage.setItem('joe-print-label-barcodeHeight', barcodeHeight.toString()); }, [barcodeHeight]);
    useEffect(() => { localStorage.setItem('joe-print-label-nameFontSize', nameFontSize.toString()); }, [nameFontSize]);

    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        if (isOpen && product) {
            if (product.stockQuantity > 0) {
                setQuantity(1);
            } else {
                setQuantity(1);
            }
        }
    }, [isOpen, product]);

    const handlePrint = () => {
        if (!product || !iframeRef.current) return;

        const dimensions = size === 'custom'
            ? { width: customWidth, height: customHeight, name: 'Custom' }
            : SIZE_DIMENSIONS[size];
        const iframe = iframeRef.current;

        // Create new document content
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc) {
            showToast.error("خطأ في نظام الطباعة");
            return;
        }

        // Generate SVG locally
        const tempSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        const getBarcodeWidth = () => {
            const isPrecisionSize = size === '44x27' || size === '40x27';
            const is48x24 = size === '48x24';
            let baseWidth = (isPrecisionSize || is48x24) ? 1.25 : (size === '38x25' ? 2 : 2.5);
            return baseWidth * barcodeWidthScale;
        };

        try {
            JsBarcode(tempSvg, product.barcode, {
                format: "CODE128",
                width: getBarcodeWidth(),
                height: barcodeHeight,
                displayValue: false,
                margin: 0,
                background: "transparent",
                fontSize: 10
            });
        } catch (e) {
            console.error(e);
            showToast.error("خطأ في توليد الباركود");
            return;
        }
        const svgString = tempSvg.outerHTML;

        // Generate HTML for printing
        const labelsHtml = Array(quantity).fill(0).map(() => {
            return `
      <div class="label ${size === '40x27' ? 'label-40x27' : ''} ${size === '48x24' ? 'label-48x24' : ''}">
        <div class="content">
            <div class="product-name centered" style="font-size: ${nameFontSize}px;">${product.name}</div>
            
            ${showBarcodeText ? `<div class="barcode-num centered">${product.barcode}</div>` : ''}
            
            <div class="barcode-container centered">
                ${svgString}
            </div>
            
            <div class="prices-row centered">
                ${showRetailPrice ? `<span class="price-val"> "ق" ${product.retailPrice.toFixed(2)}</span>` : ''}
                ${showWholesalePrice ? `<span class="price-val"> "ج" ${product.wholesalePrice.toFixed(2)}</span>` : ''}
            </div>
        </div>
      </div>
    `
        }).join('');

        doc.open();
        doc.write(`
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
        <title></title>
        <style>
            @page {
                size: ${dimensions.width}mm ${dimensions.height}mm;
                margin: 0mm;
            }
            body {
                margin: 0;
                padding: 0;
                width: ${dimensions.width}mm;
                height: ${dimensions.height}mm;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: white;
            }
            .label {
                width: ${dimensions.width}mm;
                height: ${dimensions.height}mm;
                page-break-after: always;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
                box-sizing: border-box;
                background: white;
                padding: 1mm;
            }
            .centered {
                width: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .content {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 0.5mm;
                text-align: center;
                width: 100%;
                height: 100%;
                transform: ${rotate ? 'rotate(90deg)' : 'none'};
                transform-origin: center;
            }
            .product-name {
                font-size: 11px;
                font-weight: normal;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 100%;
                line-height: 1.1;
                color: #000;
            }
            .barcode-num {
                font-size: 10px;
                font-weight: bold;
                line-height: 1;
                color: #000;
            }
            .barcode-container {
                line-height: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                width: 100%;
                overflow: hidden;
            }
            .prices-row {
                display: flex;
                justify-content: center;
                gap: 5mm;
                width: 100%;
                line-height: 1;
            }
            .price-val {
                font-size: 12px;
                font-weight: 900;
                color: #000;
            }
            svg {
                max-width: 100%;
                height: auto;
                display: block;
            }
        </style>
    </head>
    <body onload="window.print()">
        ${labelsHtml}
    </body>
    </html>
`);
        doc.close();
    };

    if (!product) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl rounded-3xl p-0 overflow-hidden ml-auto mr-auto">
                <div className="flex h-[600px] flex-col md:flex-row">

                    {/* Settings Section */}
                    <div className="w-full md:w-1/2 p-6 bg-slate-50 border-l border-slate-100 flex flex-col gap-6 overflow-y-auto">
                        <DialogHeader className="p-0 text-right">
                            <DialogTitle className="text-xl font-black text-slate-900 flex items-center gap-2">
                                <Printer className="w-5 h-5 text-indigo-600" />
                                طباعة باركود
                            </DialogTitle>
                            <DialogDescription>
                                {product.name}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">

                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700">عدد الملصقات</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        min={1}
                                        value={quantity}
                                        onChange={e => setQuantity(parseInt(e.target.value) || 1)}
                                        className="text-center font-bold text-lg h-12 rounded-xl"
                                    />
                                    <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl" onClick={() => setQuantity(q => q + 1)}><Plus size={18} /></Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700">مقاس الملصق</Label>
                                <Select value={size} onValueChange={(v: LabelSize) => setSize(v)}>
                                    <SelectTrigger className="h-12 rounded-xl bg-white"><SelectValue /></SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        {Object.entries(SIZE_DIMENSIONS).map(([key, val]) => (
                                            <SelectItem key={key} value={key}>{val.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {size === 'custom' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="font-bold text-slate-700">العرض (مم)</Label>
                                        <Input
                                            type="number"
                                            value={customWidth}
                                            onChange={e => setCustomWidth(parseInt(e.target.value) || 0)}
                                            className="h-12 rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-bold text-slate-700">الارتفاع (مم)</Label>
                                        <Input
                                            type="number"
                                            value={customHeight}
                                            onChange={e => setCustomHeight(parseInt(e.target.value) || 0)}
                                            className="h-12 rounded-xl"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4 pt-4 border-t border-slate-200">
                                <h4 className="font-black text-xs text-slate-400 uppercase tracking-widest">المحتوى</h4>

                                <div className="flex items-center justify-between">
                                    <Label className="font-bold text-slate-600">اسم المنتج</Label>
                                    <Switch checked={showName} onCheckedChange={setShowName} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label className="font-bold text-slate-600">سعر القطاعي</Label>
                                    <Switch checked={showRetailPrice} onCheckedChange={setShowRetailPrice} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label className="font-bold text-slate-600">سعر الجملة</Label>
                                    <Switch checked={showWholesalePrice} onCheckedChange={setShowWholesalePrice} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label className="font-bold text-slate-600">رقم الباركود</Label>
                                    <Switch checked={showBarcodeText} onCheckedChange={setShowBarcodeText} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label className="font-bold text-slate-600">تدوير 90 درجة</Label>
                                    <Switch checked={rotate} onCheckedChange={setRotate} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold text-slate-600">حجم خط الاسم</Label>
                                    <Input
                                        type="number"
                                        min={6}
                                        max={30}
                                        value={nameFontSize}
                                        onChange={e => setNameFontSize(parseInt(e.target.value) || 11)}
                                        className="h-10 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold text-slate-600">ارتفاع الباركود</Label>
                                    <Input
                                        type="number"
                                        min={10}
                                        max={150}
                                        value={barcodeHeight}
                                        onChange={e => setBarcodeHeight(parseInt(e.target.value) || 10)}
                                        className="h-10 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold text-slate-600">عرض الباركود (%)</Label>
                                    <Input
                                        type="number"
                                        min={1}
                                        max={100}
                                        value={Math.round(barcodeWidthScale * 100)}
                                        onChange={e => setBarcodeWidthScale((parseInt(e.target.value) || 1) / 100)}
                                        className="h-10 rounded-xl"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto pt-6">
                            <Button onClick={handlePrint} className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold gap-2 text-lg">
                                <Printer size={20} />
                                طباعة ({quantity})
                            </Button>
                        </div>
                    </div>

                    {/* Preview Section */}
                    <div className="w-full md:w-1/2 p-8 bg-white flex flex-col items-center justify-center relative">
                        <div className="absolute top-4 right-4 text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                            معاينة تقريبية
                        </div>

                        <div
                            className="border-2 border-slate-200 border-dashed rounded-lg flex flex-col items-center justify-center bg-white shadow-sm transition-all duration-300"
                            style={{
                                width: `${(size === 'custom' ? customWidth : SIZE_DIMENSIONS[size].width) * 4}px`, // Zoomed x4
                                height: `${(size === 'custom' ? customHeight : SIZE_DIMENSIONS[size].height) * 4}px`,
                                padding: '0'
                            }}
                        >
                            {/* Scaled Content Container */}
                            <div
                                className="flex flex-col items-center justify-center w-full h-full text-center transition-transform duration-300"
                                style={{ transform: rotate ? 'rotate(90deg)' : 'none' }}
                            >
                                {size === '48x24' || size === '40x27' || size === '44x27' || true ? (
                                    <div className="flex flex-col items-center justify-center w-full h-full gap-0.5" style={{ padding: '1mm' }}>
                                        {/* Row 1: Name */}
                                        <div className="text-slate-900 truncate w-full leading-tight font-normal" style={{ fontSize: `${nameFontSize}px` }}>
                                            {product.name}
                                        </div>

                                        {/* Row 2: Barcode Number */}
                                        {showBarcodeText && (
                                            <div className="font-bold text-slate-700 leading-none" style={{ fontSize: '9px' }}>
                                                {product.barcode}
                                            </div>
                                        )}

                                        {/* Row 3: Barcode Bars */}
                                        <div className="flex flex-col items-center justify-center w-full overflow-hidden">
                                            <BarcodeLabel
                                                value={product.barcode}
                                                displayValue={false}
                                                width={(size === '48x24' || size === '40x27' || size === '44x27' ? 1.25 : (size === '38x25' ? 2 : 2.5)) * barcodeWidthScale}
                                                height={barcodeHeight}
                                                fontSize={10}
                                                margin={0}
                                            />
                                        </div>

                                        {/* Row 4: Prices */}
                                        {(showRetailPrice || showWholesalePrice) && (
                                            <div className="flex items-center gap-3 font-black text-slate-900 leading-none" style={{ fontSize: '10px' }}>
                                                {showRetailPrice && <span> "ق" {product.retailPrice.toFixed(2)}</span>}
                                                {showWholesalePrice && <span> "ج" {product.wholesalePrice.toFixed(2)}</span>}
                                            </div>
                                        )}
                                    </div>
                                ) : null}
                            </div>
                        </div>

                        <div className="mt-8 text-center space-y-2">
                            <p className="text-sm font-medium text-slate-500">
                                الحجم النهائي: <span className="text-slate-900 font-bold" dir="ltr">{SIZE_DIMENSIONS[size].width}mm x {SIZE_DIMENSIONS[size].height}mm</span>
                            </p>
                            <p className="text-xs text-slate-400">
                                تأكد من اختيار حجم الورق المطابق في إعدادات الطابعة
                            </p>
                        </div>
                    </div>
                </div>

                {/* Hidden Iframe for Printing */}
                <iframe
                    ref={iframeRef}
                    className="absolute opacity-0 pointer-events-none w-0 h-0"
                    title="Print Frame"
                />
            </DialogContent>
        </Dialog>
    );
};

export default LabelPrintModal;
