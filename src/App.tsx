import { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components';

// Lazy load screens
const Dashboard = lazy(() => import('./screens/Dashboard'));
const POSScreen = lazy(() => import('./screens/POSScreen'));
const ProductManagement = lazy(() => import('./screens/ProductManagement'));
const CategoryManagement = lazy(() => import('./screens/CategoryManagement'));
const CustomerManagement = lazy(() => import('./screens/CustomerManagement'));
const InvoiceHistory = lazy(() => import('./screens/InvoiceHistory'));
const ReportsScreen = lazy(() => import('./screens/ReportsScreen'));
const SettingsScreen = lazy(() => import('./screens/SettingsScreen'));

function AppRoutes() {
  return (
    <Layout>
      <Suspense fallback={<div className="flex h-screen items-center justify-center">جاري التحميل...</div>}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pos" element={<POSScreen />} />
          <Route path="/products" element={<ProductManagement />} />
          <Route path="/categories" element={<CategoryManagement />} />
          <Route path="/customers" element={<CustomerManagement />} />
          <Route path="/invoices" element={<InvoiceHistory />} />
          <Route path="/reports" element={<ReportsScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}

function App() {
  return (
    <HashRouter>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          style: {
            direction: 'rtl',
            fontFamily: 'Inter, sans-serif'
          }
        }}
      />
      <AppRoutes />
    </HashRouter>
  );
}

export default App;
