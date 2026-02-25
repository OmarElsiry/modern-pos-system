import { useState, useEffect, useCallback } from 'react';
import { Invoice } from '../types/models';
import { TransactionState, PERSISTENCE_KEYS } from '../types/transaction';
import { SalesService } from '../services/SalesService';
import { showToast } from '../utils/toast';

/**
 * Hook to manage POS transaction state with localStorage persistence
 */
export const useTransaction = (salesService: SalesService) => {
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load initial state from localStorage
    useEffect(() => {
        const saved = localStorage.getItem(PERSISTENCE_KEYS.POS_TRANSACTION);
        if (saved) {
            try {
                const state: TransactionState = JSON.parse(saved);

                // Populate SalesService with loaded data
                // We need to ensure the service matches the loaded state
                // This assumes SalesService is initialized or we provide a way to hydrate it

                setInvoice(state.invoice);
                setSelectedCustomerId(state.selectedCustomerId || null);

                salesService.hydrate(state.invoice, state.selectedCustomerId || null);

                if (state.selectedCustomerId) {
                    salesService.setCustomer(state.selectedCustomerId);
                }

                // Note: SalesService in its current implementation might need the actual items
                // to be added back if it maintains internal state. 
                // We should check if we need to hydrate SalesService internals.
            } catch (e) {
                console.error('Failed to parse saved transaction:', e);
                localStorage.removeItem(PERSISTENCE_KEYS.POS_TRANSACTION);
            }
        } else {
            setInvoice(salesService.getCurrentInvoice());
        }
        setIsLoading(false);
    }, [salesService]);

    // Persistent save on changes
    useEffect(() => {
        if (!invoice || isLoading) return;

        const state: TransactionState = {
            invoice,
            selectedCustomerId: selectedCustomerId || undefined,
            lastUpdated: new Date().toISOString(),
        };

        localStorage.setItem(PERSISTENCE_KEYS.POS_TRANSACTION, JSON.stringify(state));
    }, [invoice, selectedCustomerId, isLoading]);

    const updateState = useCallback(() => {
        setInvoice({ ...salesService.getCurrentInvoice()! });
        setSelectedCustomerId(salesService.getSelectedCustomerId());
    }, [salesService]);

    const addProduct = async (barcode: string) => {
        const response = await salesService.addProductToInvoice(barcode);
        if (response.success) {
            updateState();
            return true;
        } else {
            showToast.error(response.error.message);
            return false;
        }
    };

    const removeItem = (itemId: string) => {
        const response = salesService.removeItemFromInvoice(itemId);
        if (response.success) {
            updateState();
        }
    };

    const updateQuantity = async (itemId: string, qty: number) => {
        const response = await salesService.updateItemQuantity(itemId, qty);
        if (response.success) {
            updateState();
        } else {
            showToast.error(response.error.message);
        }
    };

    const setCustomer = (customerId: string | null) => {
        salesService.setCustomer(customerId);
        updateState();
    };

    const setPricingType = async (type: string) => {
        const response = await salesService.setPricingType(type);
        if (response.success) {
            updateState();
        }
    };

    const clear = () => {
        salesService.cancelInvoice();
        updateState();
        localStorage.removeItem(PERSISTENCE_KEYS.POS_TRANSACTION);
    };

    const complete = async () => {
        const response = await salesService.completeInvoice();
        if (response.success) {
            updateState();
            localStorage.removeItem(PERSISTENCE_KEYS.POS_TRANSACTION);
            return response.data;
        }
        return null;
    };

    return {
        invoice,
        selectedCustomerId,
        isLoading,
        addProduct,
        removeItem,
        updateQuantity,
        setCustomer,
        setPricingType,
        clear,
        complete,
        refresh: updateState
    };
};
