import { useState, useEffect, useCallback } from 'react';
import { Product } from '../types/models';

/**
 * Hook for product search with debouncing
 * Refactored to use window.electronAPI for production performance
 */
export function useProductSearch(debounceMs: number = 300) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        if (!query) {
          const allProducts = await window.electronAPI.products.getAll();
          setResults(allProducts.slice(0, 20));
          return;
        }

        // Debounced search logic inside the effect but using async await
        const filtered = await window.electronAPI.products.search(query);
        setResults(filtered.slice(0, 20)); // Limit Renderer load
        setIsOpen(filtered.length > 0);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchProducts, query ? debounceMs : 0);
    return () => clearTimeout(timer);
  }, [query, debounceMs, refreshKey]);

  const clear = useCallback(() => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    query,
    setQuery,
    results,
    loading,
    isOpen,
    refresh,
    clear,
    close,
  };
}
