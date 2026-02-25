export interface IElectronAPI {
    products: {
        getAll: () => Promise<any[]>;
        search: (query: string) => Promise<any[]>;
        getById: (id: string) => Promise<any | null>;
        create: (input: any) => Promise<any>;
        update: (id: string, updates: any) => Promise<any>;
        delete: (id: string) => Promise<void>;
        updateStock: (id: string, quantity: number) => Promise<void>;
    };
    categories: {
        getAll: () => Promise<any[]>;
        getById: (id: string) => Promise<any | null>;
        create: (input: any) => Promise<any>;
        update: (id: string, updates: any) => Promise<any>;
        delete: (id: string) => Promise<void>;
    };
    customers: {
        getAll: () => Promise<any[]>;
        search: (query: string) => Promise<any[]>;
        getById: (id: string) => Promise<any | null>;
        create: (input: any) => Promise<any>;
        update: (id: string, updates: any) => Promise<any>;
        delete: (id: string) => Promise<void>;
        getHistory: (id: string) => Promise<any[]>;
    };
    invoices: {
        create(invoice: any, items: any[]): Promise<any>;
        getAll(): Promise<any[]>;
        getById(id: string): Promise<any>;
        refund(id: string, refundType: 'defective' | 'good_condition'): Promise<void>;
    };
    reports: {
        getSummary: (startDate: string, endDate: string) => Promise<any>;
        getBestSelling: (startDate: string, endDate: string, limit: number) => Promise<any[]>;
        getDaily: (startDate: string, endDate: string) => Promise<any[]>;
        getByCategory: (startDate: string, endDate: string) => Promise<any[]>;
        archiveSave: (snapshot: any) => Promise<{ success: boolean; error?: string }>;
    };
    settings: {
        get: () => Promise<{ success: boolean; data?: any; error?: string }>;
        update: (settings: any) => Promise<{ success: boolean; error?: string }>;
    };
    backup: {
        create: () => Promise<any>;
        restore: (backupPath: string) => Promise<any>;
        list: () => Promise<string[]>;
    };
    app: {
        getVersion: () => Promise<string>;
        toggleKiosk: (enabled: boolean) => Promise<boolean>;
        print: (options?: any) => Promise<boolean>;
    };
}

declare global {
    interface Window {
        electronAPI: IElectronAPI;
    }
}
