import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Delete, Check, ShoppingBag, DollarSign, Hash } from 'lucide-react';
import { toArabicWords } from '@/utils/tafqeet';

interface NumpadProps {
    onInput: (value: string) => void;
    onClear: () => void;
    onBackspace: () => void;
    onConfirm: () => void;
    isOpen: boolean;
    onClose: () => void;
    itemName?: string;
    itemPrice?: number;
    currentQuantity?: string;
    maxStock?: number;
    variant?: 'overlay' | 'inline';
    style?: React.CSSProperties;
}

export const Numpad: React.FC<NumpadProps> = ({
    onInput,
    onClear,
    onBackspace,
    onConfirm,
    isOpen,
    onClose,
    itemName,
    itemPrice,
    currentQuantity,
    maxStock,
    variant = 'overlay',
    style,
}) => {
    const { t } = useTranslation();
    if (!isOpen) return null;

    const buttons = [
        '3', '2', '1',
        '6', '5', '4',
        '9', '8', '7',
        '00', '0', '.'
    ];

    const NumpadButton = ({ value, onClick, className, children }: {
        value?: string;
        onClick: () => void;
        className?: string;
        children?: React.ReactNode;
    }) => (
        <button
            className={cn(
                "h-12 rounded-lg border bg-background text-lg font-semibold transition-colors hover:bg-muted active:scale-95",
                className
            )}
            onClick={onClick}
        >
            {children || value}
        </button>
    );

    if (variant === 'inline') {
        return (
            <div
                className="bg-card border rounded-xl shadow-lg p-3 w-[200px]"
                style={style}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="grid grid-cols-3 gap-2">
                    {buttons.map((btn) => (
                        <NumpadButton key={btn} value={btn} onClick={() => onInput(btn)} />
                    ))}
                    <NumpadButton onClick={onBackspace} className="bg-muted">
                        <Delete className="h-5 w-5 mx-auto" />
                    </NumpadButton>
                    <NumpadButton onClick={onClear} className="text-destructive bg-destructive/10 hover:bg-destructive/20">
                        {t('common.clear')}
                    </NumpadButton>
                    <NumpadButton onClick={onConfirm} className="bg-primary text-primary-foreground hover:bg-primary/90">
                        <Check className="h-5 w-5 mx-auto" />
                    </NumpadButton>
                </div>
            </div>
        );
    }

    const totalValue = (itemPrice || 0) * parseFloat(currentQuantity || '0');

    return (
        <div
            className="fixed inset-0 z-50 bg-white/20 backdrop-blur-[1px] flex items-end justify-center p-4 pb-12 transition-all animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="bg-white border border-slate-200 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] w-full max-w-[420px] overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header: Product Info */}
                <div className="bg-slate-50/50 p-6 border-b border-slate-100">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600">
                            <ShoppingBag className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-xl font-black text-slate-900 truncate">{itemName || t('numpad.unknownProduct')}</h2>
                            <p className="text-slate-500 font-bold text-sm">{t('numpad.unitPrice')}: {itemPrice?.toFixed(2)} {t('pos.currencySymbol')}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm transition-all">
                            <div className="flex items-center gap-2 text-slate-400 mb-1">
                                <Hash size={14} className="font-black" />
                                <span className="text-[10px] font-black uppercase tracking-wider">{t('numpad.qtyAdded')}</span>
                            </div>
                            <div className="text-3xl font-black text-slate-900 leading-none">
                                {currentQuantity || '0'}
                            </div>
                            {maxStock !== undefined && (
                                <div className={cn(
                                    "text-[10px] font-bold mt-2 px-2 py-0.5 rounded-full inline-block",
                                    parseFloat(currentQuantity || '0') >= maxStock
                                        ? "bg-red-50 text-red-600"
                                        : "bg-blue-50 text-blue-600"
                                )}>
                                    {t('numpad.available')}: {maxStock}
                                </div>
                            )}
                        </div>
                        <div className="bg-indigo-600 p-4 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all">
                            <div className="flex items-center gap-2 text-indigo-100 mb-1">
                                <DollarSign size={14} className="font-black" />
                                <span className="text-[10px] font-black uppercase tracking-wider">{t('numpad.totalValue')}</span>
                            </div>
                            <div className="text-3xl font-black text-white leading-none">
                                {totalValue.toFixed(0)} <span className="text-xs">{t('pos.currencySymbol')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Numpad Grid */}
                    <div className="grid grid-cols-3 gap-3">
                        {buttons.map((btn) => (
                            <NumpadButton
                                key={btn}
                                value={btn}
                                onClick={() => {
                                    const next = currentQuantity === '0' || currentQuantity === '' ? btn : currentQuantity + btn;
                                    const qty = parseFloat(next);
                                    if (maxStock !== undefined && qty > maxStock) return;
                                    onInput(btn);
                                }}
                                className="h-14 rounded-2xl text-xl font-black border-slate-100 bg-white text-slate-900 hover:bg-slate-50 hover:border-slate-200 transition-all shadow-sm"
                            />
                        ))}
                        <NumpadButton
                            onClick={onClear}
                            className="h-14 rounded-2xl font-black text-red-500 bg-red-50 border-red-100 hover:bg-red-100 transition-all"
                        >
                            {t('common.clear')}
                        </NumpadButton>
                        <NumpadButton
                            onClick={onBackspace}
                            className="h-14 rounded-2xl bg-slate-50 border-slate-100 hover:bg-slate-100 transition-all"
                        >
                            <Delete className="h-6 w-6 mx-auto text-slate-600" />
                        </NumpadButton>
                        <NumpadButton
                            onClick={onConfirm}
                            className="h-14 rounded-2xl bg-slate-900 text-white border-none hover:bg-black shadow-lg shadow-slate-200 transition-all"
                        >
                            <Check className="h-6 w-6 mx-auto font-black" />
                        </NumpadButton>
                    </div>

                    {/* Footer: Tafqeet */}
                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-dashed border-slate-200 text-center">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">{t('numpad.amountInWords')}</p>
                        <p className="text-sm font-bold text-slate-700 leading-relaxed">
                            {toArabicWords(totalValue)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
