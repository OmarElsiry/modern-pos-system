import { Category, CategoryInput } from '../types/models';
import { ApiResponse, ErrorCode } from '../types/responses';

/**
 * CategoryService - Refactored to use window.electronAPI (IPC)
 */
export class CategoryService {
  /**
   * Create a new category
   */
  async createCategory(input: CategoryInput): Promise<ApiResponse<Category>> {
    try {
      if (!input.name || input.name.trim().length === 0) {
        return {
          success: false,
          error: {
            code: ErrorCode.INVALID_INPUT,
            message: 'Category name is required',
            details: { field: 'name' },
          },
        };
      }

      const result = await window.electronAPI.categories.create(input);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: ErrorCode.DB_WRITE_FAILED,
          message: 'Failed to create category',
          details: error,
        },
      };
    }
  }

  /**
   * Update an existing category
   */
  async updateCategory(
    id: string,
    updates: Partial<CategoryInput>
  ): Promise<ApiResponse<Category>> {
    try {
      const result = await window.electronAPI.categories.update(id, updates);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: ErrorCode.DB_WRITE_FAILED,
          message: 'Failed to update category',
          details: error,
        },
      };
    }
  }

  /**
   * Delete a category
   */
  async deleteCategory(id: string): Promise<ApiResponse<void>> {
    try {
      // Logic for checking products should preferably happen in Main process handler
      // but we can also just call the IPC and let it fail if the handler checks it.
      await window.electronAPI.categories.delete(id);
      return {
        success: true,
        data: undefined,
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.code || ErrorCode.DB_WRITE_FAILED,
          message: error.message || 'Failed to delete category',
          details: error,
        },
      };
    }
  }

  /**
   * Get all categories
   */
  async getAllCategories(): Promise<ApiResponse<Category[]>> {
    try {
      const result = await window.electronAPI.categories.getAll();
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: ErrorCode.DB_CONNECTION_FAILED,
          message: 'Failed to fetch categories',
          details: error,
        },
      };
    }
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: string): Promise<ApiResponse<Category>> {
    try {
      const result = await window.electronAPI.categories.getById(id);
      if (!result) {
        return {
          success: false,
          error: {
            code: ErrorCode.PRODUCT_NOT_FOUND,
            message: `Category with id "${id}" not found`,
            details: { categoryId: id },
          },
        };
      }
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: ErrorCode.DB_CONNECTION_FAILED,
          message: 'Failed to fetch category',
          details: error,
        },
      };
    }
  }
}
