import { useState, useEffect, useCallback } from 'react';
import { StockAlert } from '../types/models';

/**
 * Hook to fetch and monitor low stock products
 * Refactored to use window.electronAPI (IPC)
 */
export function useStockAlerts() {
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const allProducts = await window.electronAPI.products.getAll();

      const lowStockProducts: StockAlert[] = allProducts
        .filter(product => {
          const minStock = product.minStockLevel || 10;
          return product.stockQuantity <= minStock;
        })
        .map(product => {
          const minStock = product.minStockLevel || 10;
          const severity: 'low' | 'critical' =
            product.stockQuantity === 0 ? 'critical' :
              product.stockQuantity <= minStock / 2 ? 'critical' : 'low';

          return {
            product,
            currentStock: product.stockQuantity,
            minStock,
            severity,
          };
        })
        .sort((a, b) => {
          // Sort by severity (critical first), then by stock level
          if (a.severity === 'critical' && b.severity !== 'critical') return -1;
          if (a.severity !== 'critical' && b.severity === 'critical') return 1;
          return a.currentStock - b.currentStock;
        });

      setAlerts(lowStockProducts);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stock alerts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const refresh = () => {
    loadAlerts();
  };

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const lowCount = alerts.filter(a => a.severity === 'low').length;

  return {
    alerts,
    loading,
    error,
    refresh,
    criticalCount,
    lowCount,
    totalCount: alerts.length,
  };
}
