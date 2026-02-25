import { Customer, CustomerInput } from '../types/models';
import { ApiResponse, ErrorCode } from '../types/responses';

/**
 * CustomerService - Refactored to use window.electronAPI (IPC)
 */
export class CustomerService {
  /**
   * Create a new customer
   */
  async createCustomer(input: CustomerInput): Promise<ApiResponse<Customer>> {
    try {
      // Validate input manually here if wanted, or rely on Main process
      const result = await window.electronAPI.customers.create(input);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: ErrorCode.DB_WRITE_FAILED,
          message: 'Failed to create customer',
          details: error,
        },
      };
    }
  }

  /**
   * Update an existing customer
   */
  async updateCustomer(
    id: string,
    updates: Partial<CustomerInput>
  ): Promise<ApiResponse<Customer>> {
    try {
      const result = await window.electronAPI.customers.update(id, updates);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: ErrorCode.DB_WRITE_FAILED,
          message: 'Failed to update customer',
          details: error,
        },
      };
    }
  }

  /**
   * Delete a customer
   */
  async deleteCustomer(id: string): Promise<ApiResponse<void>> {
    try {
      await window.electronAPI.customers.delete(id);
      return {
        success: true,
        data: undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: ErrorCode.DB_WRITE_FAILED,
          message: 'Failed to delete customer',
          details: error,
        },
      };
    }
  }

  /**
   * Get all customers with optional search
   */
  async getAllCustomers(searchTerm?: string): Promise<ApiResponse<Customer[]>> {
    try {
      let customers: Customer[];
      if (searchTerm) {
        customers = await window.electronAPI.customers.search(searchTerm);
      } else {
        customers = await window.electronAPI.customers.getAll();
      }

      return {
        success: true,
        data: customers,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: ErrorCode.DB_CONNECTION_FAILED,
          message: 'Failed to fetch customers',
          details: error,
        },
      };
    }
  }

  /**
   * Get customer by ID
   */
  async getCustomerById(id: string): Promise<ApiResponse<Customer>> {
    try {
      const result = await window.electronAPI.customers.getById(id);
      if (!result) {
        return {
          success: false,
          error: {
            code: ErrorCode.PRODUCT_NOT_FOUND,
            message: 'Customer not found',
            details: { customerId: id },
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
          message: 'Failed to fetch customer',
          details: error,
        },
      };
    }
  }

  /**
   * Get customer purchase history
   */
  async getCustomerPurchaseHistory(customerId: string): Promise<ApiResponse<any[]>> {
    try {
      const history = await window.electronAPI.customers.getHistory(customerId);
      return {
        success: true,
        data: history,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: ErrorCode.DB_CONNECTION_FAILED,
          message: 'Failed to fetch purchase history',
          details: error,
        },
      };
    }
  }
}
