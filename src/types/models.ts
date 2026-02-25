export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  barcode: string;
  categoryId: string;
  wholesalePrice: number;
  retailPrice: number;
  purchasePrice: number;
  stockQuantity: number;
  minStockLevel?: number;
  metadata?: Record<string, any>;
  categoryName?: string;
  createdAt: Date;
  updatedAt: Date;
  is_deleted?: boolean;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  pricingType: string;
  items: InvoiceItem[];
  totalAmount: number;
  customerId?: string;
  userId?: string;
  status?: 'completed' | 'voided' | 'refunded';
  refundType?: 'defective' | 'good_condition';
  paymentMethod?: 'cash' | 'card' | 'mobile';
  notes?: string;
  customerName?: string;
  itemCount?: number;
  createdAt: Date;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  purchasePrice?: number;
}

export interface SalesReport {
  totalSales: number;
  totalInvoices: number;
  averageInvoiceValue: number;
  salesByPricingType: {
    wholesale: number;
    retail: number;
  };
}

export interface ProductSalesStats {
  productId: string;
  productName: string;
  totalQuantitySold: number;
  totalRevenue: number;
}

export interface InventoryReport {
  products: Array<{
    id: string;
    name: string;
    category: string;
    stockQuantity: number;
    wholesaleValue: number;
    retailValue: number;
  }>;
  totalProducts: number;
  totalWholesaleValue: number;
  totalRetailValue: number;
}

export type PricingType = string;

export interface ProductInput {
  name: string;
  barcode: string;
  categoryId: string;
  wholesalePrice: number;
  retailPrice: number;
  purchasePrice: number;
  stockQuantity: number;
  minStockLevel?: number;
  metadata?: Record<string, any>;
}

export interface CategoryInput {
  name: string;
  description?: string;
}

export interface ProductFilters {
  categoryId?: string;
  searchTerm?: string;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

// Customer Management
export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  totalPurchases: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerInput {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

// User Management & Authentication
export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

export type UserRole = 'admin' | 'manager' | 'cashier';

export interface UserInput {
  username: string;
  password: string;
  fullName: string;
  role: UserRole;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: Date;
}

// Activity Logging
export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: string;
  createdAt: Date;
}

// Search & Filters
export interface SearchResult<T> {
  items: T[];
  total: number;
  query: string;
}

export interface InvoiceFilters {
  status?: 'completed' | 'voided' | 'refunded';
  customerId?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  searchTerm?: string;
}

// Alerts
export interface StockAlert {
  product: Product;
  currentStock: number;
  minStock: number;
  severity: 'low' | 'critical';
}

// Print Templates
export interface ReceiptData {
  invoice: Invoice;
  customer?: Customer;
  user?: User;
  items: InvoiceItem[];
  businessInfo: BusinessInfo;
}

export interface BusinessInfo {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  taxId?: string;
  logo?: string; // Base64 logo
  logoPosition?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  logo2?: string; // Second logo
  logo2Position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  showLogo2?: boolean;
  showName: boolean;
  showAddress: boolean;
  showPhone: boolean;
  returnPolicy?: string;
  thankYouNote?: string;
}

export interface LabelData {
  product: Product;
  includePrice: boolean;
  labelSize: 'small' | 'medium' | 'large';
}

// System Settings & Automation
export interface InvoiceElement {
  id: string;
  type: 'text' | 'field' | 'image' | 'items_table' | 'line';
  x: number; // Percentage from left
  y: number; // Percentage from top
  width?: number;
  height?: number;
  content?: string;
  field?: string;
  fontSize?: number;
  fontWeight?: string;
  alignment?: 'left' | 'center' | 'right';
  isVisible: boolean;
  rotation?: number; // degrees
}

export interface InvoiceTemplate {
  id: string;
  name: string;
  type: 'A4' | 'thermal';
  elements: InvoiceElement[];
}

export interface SystemSettings {
  businessInfo: BusinessInfo;
  archivePath?: string;
  a4Template?: InvoiceTemplate;
  thermalTemplate?: InvoiceTemplate;
  autoPrint?: boolean;
  pricingOpts?: {
    tier1Name: string;
    tier2Name: string;
    showTier2: boolean;
    customTiers?: Array<{ id: string; name: string }>;
  };
}

// Daily Data Persistence
export interface DailySnapshot {
  date: string; // YYYY-MM-DD
  totalSales: number;
  invoiceCount: number;
  topProducts: Array<{ name: string; quantity: number }>;
  stockAlertsCount: number;
  cashSales: number;
  cardSales: number;
  lastUpdated: Date;
}

