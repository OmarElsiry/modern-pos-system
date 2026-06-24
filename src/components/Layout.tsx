import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  BarChart3,
  Settings,
  Menu,
  ChevronLeft,
  ChevronRight,
  Package,
  Layers,
  Users,
  History,
  X,
  Maximize,
  Minimize
} from 'lucide-react';
import Onboarding from './Onboarding';
import { useStockAlerts } from '../hooks/useStockAlerts';
import { StockAlertBadge, StockAlert } from './StockAlert';
import { CommandPalette } from './CommandPalette';
import { useTranslation } from 'react-i18next';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isKiosk, setIsKiosk] = useState(false);
  const [showStockAlerts, setShowStockAlerts] = useState(false);
  const location = useLocation();
  const stockAlerts = useStockAlerts();
  const { t } = useTranslation();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu on window resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleToggleKiosk = async () => {
    const newKioskState = !isKiosk;
    try {
      await window.electronAPI.app.toggleKiosk(newKioskState);
      setIsKiosk(newKioskState);
    } catch (error) {
      console.error('Failed to toggle kiosk mode:', error);
    }
  };

  const navKeyMap: Record<string, string> = { navPos: 'pos', dashboard: 'dashboard', products: 'products', categories: 'categories', customers: 'customers', invoices: 'invoices', reports: 'reports', settings: 'settings' };

  const navItems = [
    { to: '/pos', icon: <ShoppingCart size={20} />, label: 'navPos' },
    { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'dashboard' },
    { to: '/products', icon: <Package size={20} />, label: 'products' },
    { to: '/categories', icon: <Layers size={20} />, label: 'categories' },
    { to: '/customers', icon: <Users size={20} />, label: 'customers' },
    { to: '/invoices', icon: <History size={20} />, label: 'invoices' },
    { to: '/reports', icon: <BarChart3 size={20} />, label: 'reports' },
    { to: '/settings', icon: <Settings size={20} />, label: 'settings' },
  ];

  return (
    <div className={`layout ${isCollapsed ? 'layout-collapsed' : ''}`}>
      {/* Mobile hamburger button - visible only on mobile */}
      <button
        className="mobile-menu-toggle"
        onClick={toggleMobileMenu}
        aria-label={t('layout.openMenu')}
        aria-expanded={isMobileMenuOpen}
      >
        <Menu size={24} />
      </button>

      {/* Mobile overlay backdrop */}
      {isMobileMenuOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <h1 className={`sidebar-title ${isCollapsed ? 'hidden-labels' : ''}`}>{t('layout.sidebarTitle')}</h1>
            {!isCollapsed && (
                <button
                  onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
                  className="text-[10px] text-zinc-500 bg-zinc-800/50 px-2 py-0.5 rounded border border-zinc-700/50 mt-1 self-start hover:bg-zinc-800 hover:text-zinc-300 transition-colors cursor-pointer"
                >
                  {t('layout.shortcutHint')}
                </button>
              )}
          </div>
        </div>
          {/* Desktop collapse button */}
          <button
            onClick={toggleSidebar}
            className="sidebar-toggle desktop-only"
            aria-label={isCollapsed ? t('layout.expandMenu') : t('layout.collapseMenu')}
          >
            {isCollapsed ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
          {/* Mobile close button */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="sidebar-toggle mobile-only"
            aria-label={t('layout.closeMenu')}
            title={t('layout.closeMenu')}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {!isCollapsed && <span className="nav-label">{t('nav.' + (navKeyMap[item.label] || item.label), item.label)}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          {stockAlerts.totalCount > 0 && (
            <div className="px-3 mb-2">
              <StockAlertBadge
                count={stockAlerts.totalCount}
                severity={stockAlerts.criticalCount > 0 ? 'critical' : 'low'}
                onClick={() => setShowStockAlerts(!showStockAlerts)}
              />
            </div>
          )}

          <button className="nav-item" onClick={handleToggleKiosk}>
            <span className="nav-icon">{isKiosk ? <Minimize size={20} /> : <Maximize size={20} />}</span>
            {!isCollapsed && <span className="nav-label">{isKiosk ? t('layout.exitKioskMode') : t('layout.kioskMode')}</span>}
          </button>
        </div>
      </aside>

      <main className="content">
        {children}
        {showStockAlerts && stockAlerts.totalCount > 0 && (
          <div className="fixed bottom-20 right-8 z-50 w-80 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            <StockAlert
              alerts={stockAlerts.alerts}
              onProductClick={() => setShowStockAlerts(false)}
            />
          </div>
        )}
      </main>

      {/* Global Command Palette */}
      <CommandPalette toggleStockAlerts={() => setShowStockAlerts(!showStockAlerts)} />

      <Onboarding onComplete={() => { }} />
    </div>
  );
};

export default Layout;
