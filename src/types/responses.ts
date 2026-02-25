export enum ErrorCode {
  // Validation Errors (1xxx)
  DUPLICATE_BARCODE = 'ERR_1001',
  INVALID_INPUT = 'ERR_1002',
  NEGATIVE_QUANTITY = 'ERR_1003',
  
  // Database Errors (2xxx)
  DB_CONNECTION_FAILED = 'ERR_2001',
  DB_WRITE_FAILED = 'ERR_2002',
  FOREIGN_KEY_CONSTRAINT = 'ERR_2003',
  
  // Business Logic Errors (3xxx)
  CATEGORY_HAS_PRODUCTS = 'ERR_3001',
  INSUFFICIENT_STOCK = 'ERR_3002',
  PRODUCT_NOT_FOUND = 'ERR_3003',
  BARCODE_NOT_FOUND = 'ERR_3004',
  
  // Hardware Errors (4xxx)
  SCANNER_READ_FAILED = 'ERR_4001',
  SCANNER_DISCONNECTED = 'ERR_4002',
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;
