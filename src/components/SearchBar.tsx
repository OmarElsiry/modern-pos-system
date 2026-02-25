import React, { useRef, useEffect } from 'react';
import { Product } from '../types/models';
import './SearchBar.css';

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  results: Product[];
  loading: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  onEnter?: (query: string) => void;
  showSuccess?: boolean;
  placeholder?: string;
  label?: string;
  autoFocus?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  query,
  onQueryChange,
  results,
  loading,
  isOpen,
  onClose,
  onSelectProduct,
  onEnter,
  showSuccess,
  placeholder = 'ابحث بالاسم، الكود، أو امسح الباركود...',
  label,
  autoFocus,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [successVisible, setSuccessVisible] = React.useState(false);

  // Trigger success animation
  React.useEffect(() => {
    if (showSuccess) {
      setSuccessVisible(true);
      const timer = setTimeout(() => setSuccessVisible(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F2 to focus search
      if (e.key === 'F2') {
        e.preventDefault();
        inputRef.current?.focus();
      }

      // ESC to close
      if (e.key === 'Escape') {
        onClose();
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      onEnter?.(query.trim());
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  const handleSelectProduct = (product: Product) => {
    onSelectProduct(product);
    onQueryChange('');
    onClose();
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={index}>{part}</mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className={`search-bar-container ${successVisible ? 'show-success' : ''}`} ref={containerRef}>
      {label && <label className="search-label">{label}</label>}
      <div className="search-input-wrapper">
        <span className="search-icon">
          {successVisible ? (
            <svg className="success-check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          )}
        </span>
        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={handleInputKeyDown}
          autoComplete="off"
          autoFocus={autoFocus}
        />
        {query && (
          <button
            className="search-clear"
            onClick={() => {
              onQueryChange('');
              onClose();
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
        {loading && (
          <span className="search-loading">
            <svg className="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
            </svg>
          </span>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="search-results">
          {results.map((product) => (
            <div
              key={product.id}
              className="search-result-item"
              onClick={() => handleSelectProduct(product)}
            >
              <div className="result-main">
                <div className="result-name">
                  {highlightMatch(product.name, query)}
                </div>
                <div className="result-barcode">
                  {highlightMatch(product.barcode, query)}
                </div>
              </div>
              <div className="result-info">
                <div className="result-price">
                  {product.retailPrice.toFixed(2)} ج.م
                </div>
                <div className={`result-stock ${product.stockQuantity === 0 ? 'out-of-stock' : ''}`}>
                  {product.stockQuantity === 0 ? 'نفذ' : `${product.stockQuantity} متاح`}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && !loading && (
        <div className="search-results">
          <div className="search-no-results">
            <span className="no-results-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
            <p>لا توجد نتائج لـ "{query}"</p>
          </div>
        </div>
      )}
    </div>
  );
};
