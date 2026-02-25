
# Research: Fix Net Sales & Invoice Count in InvoiceHistory

## Problem
The "InvoiceHistory" screen displays two key metrics:
1. **Total Invoices** ("إجمالي الفواتير"): Currently counts ALL invoices regardless of status.
2. **Net Sales** ("صافي المبيعات"): Currently sums `totalAmount` for ALL invoices, including `voided` and `refunded` ones.

This provides misleading financial data, as refunded sales should not be credited as revenue.

## Analysis
- **File**: `src/screens/InvoiceHistory.tsx`
- **Current Logic**:
  ```typescript
  {invoices.length} // Total Invoices
  {invoices.reduce((sum, inv) => sum + inv.totalAmount, 0)} // Net Sales
  ```
- **Invoices State**: Populated by `salesService.getAllInvoices()`, which fetches all records.

## Proposed Solution

Based on standard accounting practices and the user's report:

1. **Net Sales Calculation**:
   - MUST filter invoices where `status` is `'completed'` OR `status` is missing (legacy).
   - MUST EXCLUDE `status === 'voided'` and `status === 'refunded'`.

2. **Total Invoices Count**:
   - While "Total Invoices" could technically mean "Total Records", usually in a sales context, it refers to valid sales.
   - However, for an *audit* history view, seeing the count of all generated invoices (including cancelled ones) is often useful.
   - **Decision**: Keep "Total Invoices" as count of ALL records (for audit purposes), but perhaps add a breakdown or clarify label.
   - **Refinement**: Let's stick to fixing the "Net Sales" value first as that's the financial error. The user didn't complain about the count, only the value "This value".

## Implementation Plan
1. Calculate `netSales`:
   ```typescript
   const netSales = invoices
     .filter(inv => inv.status === 'completed' || !inv.status)
     .reduce((sum, inv) => sum + inv.totalAmount, 0);
   ```
2. Update JSX to use `netSales` instead of raw sum.
