import { Invoice } from './models';

/**
 * Encapsulates the state of an ongoing transaction in the POS
 */
export interface TransactionState {
    invoice: Invoice;
    selectedCustomerId?: string;
    lastUpdated: string; // ISO string for staleness checks
}

/**
 * Keys used for localStorage persistence
 */
export const PERSISTENCE_KEYS = {
    POS_TRANSACTION: 'joecashier_pos_transaction',
    ACTIVE_ROUTE: 'joecashier_active_route',
};
