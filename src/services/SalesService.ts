import { Invoice, InvoiceItem, PricingType } from '../types/models';
import { ApiResponse, ErrorCode } from '../types/responses';
import { v4 as uuidv4 } from 'uuid';

/**
 * SalesService - Business logic for sales and invoice management
 * Refactored to use window.electronAPI for production security
 */
export class SalesService {
  private currentInvoice: Invoice | null = null;
  private selectedCustomerId: string | null = null;

  constructor() {
    this.initializeNewInvoice('retail');
  }

  setCustomer(customerId: string | null): void {
    this.selectedCustomerId = customerId;
  }

  getSelectedCustomerId(): string | null {
    return this.selectedCustomerId;
  }

  /**
   * Hydrate the service with existing state (for persistence)
   */
  hydrate(invoice: Invoice, customerId: string | null): void {
    this.currentInvoice = invoice;
    this.selectedCustomerId = customerId;
  }

  private initializeNewInvoice(pricingType: PricingType): void {
    this.currentInvoice = {
      id: uuidv4(),
      invoiceNumber: '',
      pricingType,
      items: [],
      totalAmount: 0,
      createdAt: new Date(),
    };
  }

  getCurrentInvoice(): Invoice | null {
    return this.currentInvoice;
  }

  async setPricingType(pricingType: PricingType): Promise<ApiResponse<Invoice>> {
    if (!this.currentInvoice) {
      return {
        success: false,
        error: {
          code: ErrorCode.INVALID_INPUT,
          message: 'No active invoice',
        },
      };
    }

    this.currentInvoice.pricingType = pricingType;

    for (const item of this.currentInvoice.items) {
      const product = await window.electronAPI.products.getById(item.productId);
      if (product) {
        const newPrice = pricingType === 'wholesale'
          ? product.wholesalePrice
          : product.retailPrice;

        item.unitPrice = newPrice;
        item.totalPrice = item.quantity * newPrice;
      }
    }

    this.currentInvoice.totalAmount = this.calculateInvoiceTotal(this.currentInvoice);

    return {
      success: true,
      data: {
        ...this.currentInvoice,
        items: [...this.currentInvoice.items],
      },
    };
  }

  async addProductToInvoice(barcode: string): Promise<ApiResponse<Invoice>> {
    try {
      if (!this.currentInvoice) {
        return {
          success: false,
          error: {
            code: ErrorCode.INVALID_INPUT,
            message: 'No active invoice',
          },
        };
      }

      const product = await window.electronAPI.products.search(barcode).then(res => res[0]);

      if (!product || (product.barcode !== barcode && product.id !== barcode)) {
        return {
          success: false,
          error: {
            code: ErrorCode.BARCODE_NOT_FOUND,
            message: `Product with barcode "${barcode}" not found`,
            details: { barcode },
          },
        };
      }

      const existingItem = this.currentInvoice.items.find(
        item => item.productId === product.id
      );

      const requestedQuantity = existingItem ? existingItem.quantity + 1 : 1;

      if (requestedQuantity > product.stockQuantity) {
        return {
          success: false,
          error: {
            code: ErrorCode.INSUFFICIENT_STOCK,
            message: `الكمية المطلوبة غير متوفرة. المتاح: ${product.stockQuantity}`,
            details: { stockQuantity: product.stockQuantity },
          },
        };
      }

      if (existingItem) {
        existingItem.quantity += 1;
        existingItem.totalPrice = existingItem.quantity * existingItem.unitPrice;
      } else {
        const unitPrice = this.currentInvoice.pricingType === 'wholesale'
          ? product.wholesalePrice
          : product.retailPrice;

        const newItem: InvoiceItem = {
          id: uuidv4(),
          invoiceId: this.currentInvoice.id,
          productId: product.id,
          productName: product.name,
          quantity: 1,
          unitPrice,
          totalPrice: unitPrice,
        };

        this.currentInvoice.items.push(newItem);
      }

      this.currentInvoice.totalAmount = this.calculateInvoiceTotal(this.currentInvoice);

      return {
        success: true,
        data: { ...this.currentInvoice },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: ErrorCode.DB_CONNECTION_FAILED,
          message: 'Failed to add product to invoice',
          details: error,
        },
      };
    }
  }

  async updateItemQuantity(itemId: string, quantity: number): Promise<ApiResponse<Invoice>> {
    if (!this.currentInvoice) {
      return {
        success: false,
        error: {
          code: ErrorCode.INVALID_INPUT,
          message: 'No active invoice',
        },
      };
    }

    if (quantity <= 0) {
      return {
        success: false,
        error: {
          code: ErrorCode.NEGATIVE_QUANTITY,
          message: 'Quantity must be positive',
          details: { quantity },
        },
      };
    }

    const item = this.currentInvoice.items.find(i => i.id === itemId);

    if (!item) {
      return {
        success: false,
        error: {
          code: ErrorCode.PRODUCT_NOT_FOUND,
          message: `Item with id "${itemId}" not found in invoice`,
          details: { itemId },
        },
      };
    }

    const product = await window.electronAPI.products.getById(item.productId);
    if (product && quantity > product.stockQuantity) {
      return {
        success: false,
        error: {
          code: ErrorCode.INSUFFICIENT_STOCK,
          message: `الكمية المطلوبة غير متوفرة. المتاح: ${product.stockQuantity}`,
          details: { stockQuantity: product.stockQuantity },
        },
      };
    }

    item.quantity = quantity;
    item.totalPrice = item.quantity * item.unitPrice;
    this.currentInvoice.totalAmount = this.calculateInvoiceTotal(this.currentInvoice);

    return {
      success: true,
      data: { ...this.currentInvoice },
    };
  }

  removeItemFromInvoice(itemId: string): ApiResponse<Invoice> {
    if (!this.currentInvoice) {
      return {
        success: false,
        error: {
          code: ErrorCode.INVALID_INPUT,
          message: 'No active invoice',
        },
      };
    }

    const itemIndex = this.currentInvoice.items.findIndex(i => i.id === itemId);

    if (itemIndex === -1) {
      return {
        success: false,
        error: {
          code: ErrorCode.PRODUCT_NOT_FOUND,
          message: `Item with id "${itemId}" not found in invoice`,
          details: { itemId },
        },
      };
    }

    this.currentInvoice.items.splice(itemIndex, 1);
    this.currentInvoice.totalAmount = this.calculateInvoiceTotal(this.currentInvoice);

    return {
      success: true,
      data: { ...this.currentInvoice },
    };
  }

  calculateInvoiceTotal(invoice: Invoice): number {
    return invoice.items.reduce((sum, item) => sum + item.totalPrice, 0);
  }

  async completeInvoice(): Promise<ApiResponse<Invoice>> {
    try {
      if (!this.currentInvoice) {
        return {
          success: false,
          error: {
            code: ErrorCode.INVALID_INPUT,
            message: 'No active invoice',
          },
        };
      }

      if (this.currentInvoice.items.length === 0) {
        return {
          success: false,
          error: {
            code: ErrorCode.INVALID_INPUT,
            message: 'Cannot complete empty invoice',
          },
        };
      }

      // Check stock and save via IPC
      const invoiceData = {
        pricingType: this.currentInvoice.pricingType,
        totalAmount: this.currentInvoice.totalAmount,
        customerId: this.selectedCustomerId || undefined,
        userId: 'default-admin-001', // Fallback for now
      };

      const previousPricingType = this.currentInvoice.pricingType;
      const result = await window.electronAPI.invoices.create(invoiceData, this.currentInvoice.items);

      // result is the full Invoice object from the repository
      const completedInvoice = result as unknown as Invoice;

      this.selectedCustomerId = null;
      this.initializeNewInvoice(previousPricingType);

      return {
        success: true,
        data: completedInvoice,
      };
    } catch (error) {
      const err = error as Error;
      if (err.message.includes('Insufficient stock')) {
        return {
          success: false,
          error: {
            code: ErrorCode.INSUFFICIENT_STOCK,
            message: err.message,
            details: error,
          },
        };
      }
      return {
        success: false,
        error: {
          code: ErrorCode.DB_WRITE_FAILED,
          message: 'Failed to complete invoice',
          details: error,
        },
      };
    }
  }

  cancelInvoice(): ApiResponse<void> {
    if (!this.currentInvoice) {
      return {
        success: false,
        error: {
          code: ErrorCode.INVALID_INPUT,
          message: 'No active invoice',
        },
      };
    }

    const previousPricingType = this.currentInvoice.pricingType;
    this.initializeNewInvoice(previousPricingType);

    return {
      success: true,
      data: undefined,
    };
  }

  /**
   * Get recently created invoices
   */
  async getRecentInvoices(limit: number): Promise<ApiResponse<any[]>> {
    try {
      const invoices = await window.electronAPI.invoices.getAll();
      // Sort by date descending and take top N
      const sorted = [...invoices].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ).slice(0, limit);

      // Map to include customer names and item counts (handled by IPC in real scenarios usually)
      // but for now we follow the existing pattern
      return {
        success: true,
        data: sorted,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: ErrorCode.DB_CONNECTION_FAILED,
          message: 'Failed to fetch recent invoices',
          details: error,
        },
      };
    }
  }

  /**
   * Get all invoices
   */
  async getAllInvoices(): Promise<ApiResponse<any[]>> {
    try {
      const invoices = await window.electronAPI.invoices.getAll();
      return {
        success: true,
        data: invoices,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: ErrorCode.DB_CONNECTION_FAILED,
          message: 'Failed to fetch all invoices',
          details: error,
        },
      };
    }
  }

  /**
   * Get invoice by ID with items
   */
  async getInvoiceById(id: string): Promise<ApiResponse<any>> {
    try {
      const invoice = await window.electronAPI.invoices.getById(id);
      if (!invoice) {
        return {
          success: false,
          error: {
            code: ErrorCode.PRODUCT_NOT_FOUND,
            message: `Invoice with id ${id} not found`,
          },
        };
      }
      return {
        success: true,
        data: invoice,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: ErrorCode.DB_CONNECTION_FAILED,
          message: 'Failed to fetch invoice details',
          details: error,
        },
      };
    }
  }
  /**
   * Refund an existing invoice
   * @param refundType 'defective' = no restock, 'good_condition' = restock items
   */
  async refundInvoice(id: string, refundType: 'defective' | 'good_condition'): Promise<ApiResponse<void>> {
    try {
      await window.electronAPI.invoices.refund(id, refundType);
      return {
        success: true,
        data: undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: ErrorCode.DB_WRITE_FAILED,
          message: 'Failed to refund invoice',
          details: error,
        },
      };
    }
  }
}
