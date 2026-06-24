import React from 'react';
import { useTranslation } from 'react-i18next';
import { StockAlert as StockAlertType } from '../types/models';
import { cn } from '@/lib/utils';
import { AlertTriangle, AlertCircle, ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface StockAlertProps {
  alerts: StockAlertType[];
  onProductClick?: (productId: string) => void;
}

export const StockAlert: React.FC<StockAlertProps> = ({ alerts, onProductClick }) => {
  const { t } = useTranslation();

  if (alerts.length === 0) {
    return null;
  }

  const criticalAlerts = alerts.filter(a => a.severity === 'critical');
  const lowAlerts = alerts.filter(a => a.severity === 'low');

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden" dir="rtl">
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
          <AlertTriangle className="text-orange-500" size={18} />
          {t('stockAlert.title')}
        </h3>
        <div className="flex gap-2">
          {criticalAlerts.length > 0 && (
            <Badge variant="destructive" className="rounded-full px-2 py-0.5 text-[10px] font-black">
              {criticalAlerts.length} {t('stockAlert.critical')}
            </Badge>
          )}
          {lowAlerts.length > 0 && (
            <Badge className="bg-orange-100 text-orange-600 hover:bg-orange-100 rounded-full px-2 py-0.5 text-[10px] font-black border-none">
              {lowAlerts.length} {t('stockAlert.low')}
            </Badge>
          )}
        </div>
      </div>

      <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-100">
        {alerts.map((alert) => (
          <div
            key={alert.product.id}
            className={cn(
              "p-4 flex items-center gap-4 cursor-pointer transition-colors duration-200",
              alert.severity === 'critical' ? "hover:bg-red-50" : "hover:bg-orange-50"
            )}
            onClick={() => onProductClick?.(alert.product.id)}
          >
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
              alert.severity === 'critical' ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"
            )}>
              {alert.severity === 'critical' ? <AlertCircle size={20} /> : <AlertTriangle size={20} />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-slate-900 truncate">{alert.product.name}</div>
              <div className="text-[11px] font-medium text-slate-500 mt-0.5">
                {t('stockAlert.available')}: <span className="text-slate-900 font-bold">{alert.currentStock}</span> / {t('stockAlert.minStock')}: {alert.minStock}
              </div>
            </div>

            <div className="shrink-0">
              {alert.currentStock === 0 ? (
                <span className="inline-flex px-2 py-1 rounded-lg bg-red-600 text-[10px] font-black text-white">{t('stockAlert.outOfStock')}</span>
              ) : (
                <span className="inline-flex px-2 py-1 rounded-lg bg-orange-500 text-[10px] font-black text-white">{t('stockAlert.low')}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface StockAlertBadgeProps {
  count: number;
  severity?: 'critical' | 'low';
  onClick?: () => void;
}

export const StockAlertBadge: React.FC<StockAlertBadgeProps> = ({
  count,
  severity = 'low',
  onClick
}) => {
  const { t } = useTranslation();

  if (count === 0) {
    return null;
  }

  return (
    <button
      className={cn(
        "relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 active:scale-90",
        severity === 'critical'
          ? "bg-red-50 text-red-600 hover:bg-red-100"
          : "bg-orange-50 text-orange-600 hover:bg-orange-100"
      )}
      onClick={onClick}
      title={t('stockAlert.needsRestock', { count })}
    >
      <ShoppingCart size={20} />
      <span className={cn(
        "absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white border-2 border-white animate-bounce",
        severity === 'critical' ? "bg-red-600" : "bg-orange-600"
      )}>
        {count}
      </span>
    </button>
  );
};
