import { jest } from '@jest/globals';

export const initializeDatabase = jest.fn();
export const closeDatabase = jest.fn();
export const getDatabase = jest.fn();
export const isDatabaseInitialized = jest.fn().mockReturnValue(true);
export const executeTransaction = jest.fn((callback: any) => callback(getDatabase()));
