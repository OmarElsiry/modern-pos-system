import { Product, ProductInput, ProductFilters } from '../types/models';
import { ApiResponse, ErrorCode } from '../types/responses';

/**
 * ProductService - Refactored to use window.electronAPI (IPC)
 * This ensures all DB operations happen in the Main process.
 */
export class ProductService {
  /**
   * Create a new product
   */
  async createProduct(input: ProductInput): Promise<ApiResponse<Product>> {
    try {
      // Validation could still happen here if needed, but for now we trust the Main process or bridge
      const result = await window.electronAPI.products.create(input);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      const err = error as any;
      return {
        success: false,
        error: {
          code: err.code || ErrorCode.DB_WRITE_FAILED,
          message: err.message || 'Failed to create product',
          details: error,
        },
      };
    }
  }

  /**
   * Update an existing product
   */
  async updateProduct(
    id: string,
    updates: Partial<ProductInput>
  ): Promise<ApiResponse<Product>> {
    try {
      const result = await window.electronAPI.products.update(id, updates);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      const err = error as any;
      return {
        success: false,
        error: {
          code: err.code || ErrorCode.DB_WRITE_FAILED,
          message: err.message || 'Failed to update product',
          details: error,
        },
      };
    }
  }

  /**
   * Delete a product
   */
  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    try {
      await window.electronAPI.products.delete(id);
      return {
        success: true,
        data: undefined,
      };
    } catch (error) {
      const err = error as any;
      return {
        success: false,
        error: {
          code: err.code || ErrorCode.DB_WRITE_FAILED,
          message: err.message || 'Failed to delete product',
          details: error,
        },
      };
    }
  }

  /**
   * Find product by barcode
   */
  async findByBarcode(barcode: string): Promise<ApiResponse<Product>> {
    try {
      const results = await window.electronAPI.products.search(barcode);
      const product = results.find(p => p.barcode === barcode);

      if (!product) {
        return {
          success: false,
          error: {
            code: ErrorCode.BARCODE_NOT_FOUND,
            message: `Product with barcode "${barcode}" not found`,
            details: { barcode },
          },
        };
      }

      return {
        success: true,
        data: product,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: ErrorCode.DB_CONNECTION_FAILED,
          message: 'Failed to find product by barcode',
          details: error,
        },
      };
    }
  }

  /**
   * Get all products with optional filters
   */
  async getAllProducts(filters?: ProductFilters): Promise<ApiResponse<Product[]>> {
    try {
      let products: Product[];
      if (filters?.searchTerm) {
        products = await window.electronAPI.products.search(filters.searchTerm);
      } else {
        products = await window.electronAPI.products.getAll();
      }

      if (filters?.categoryId) {
        products = products.filter(p => p.categoryId === filters.categoryId);
      }

      return {
        success: true,
        data: products,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: ErrorCode.DB_CONNECTION_FAILED,
          message: 'Failed to fetch products',
          details: error,
        },
      };
    }
  }

  /**
   * Update product stock quantity
   */
  async updateStock(productId: string, quantity: number): Promise<ApiResponse<void>> {
    try {
      await window.electronAPI.products.updateStock(productId, quantity);
      return {
        success: true,
        data: undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: ErrorCode.DB_WRITE_FAILED,
          message: 'Failed to update stock',
          details: error,
        },
      };
    }
  }

  /**
   * Get product by ID
   */
  async getProductById(id: string): Promise<ApiResponse<Product>> {
    try {
      const product = await window.electronAPI.products.getById(id);
      if (!product) {
        return {
          success: false,
          error: {
            code: ErrorCode.PRODUCT_NOT_FOUND,
            message: `Product with id "${id}" not found`,
            details: { productId: id },
          },
        };
      }
      return {
        success: true,
        data: product,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: ErrorCode.DB_CONNECTION_FAILED,
          message: 'Failed to fetch product',
          details: error,
        },
      };
    }
  }
}
