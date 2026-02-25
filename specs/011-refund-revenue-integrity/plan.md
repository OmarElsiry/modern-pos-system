# Implementation Plan: Refund Revenue Integrity

## Overview

Fix all financial calculations to properly exclude refunded invoices from revenue, and decrement customer totals on refund.

## Proposed Changes

---

### IPC Report Handlers (Critical Fix)

#### [MODIFY] [reports.ts](file:///c:/Users/PotterParker/Desktop/JOECASHIER/electron/ipc/reports.ts)

All 4 IPC handlers (`getSummary`, `getBestSelling`, `getDaily`, `getByCategory`) currently filter:
```ts
invoices.filter(inv => inv.status !== 'voided')
```
**Change to:**
```ts
invoices.filter(inv => inv.status === 'completed')
```
This is safer — it whitelists only `completed` invoices instead of blacklisting `voided`. Any future status (e.g. `cancelled`, `partial_refund`) will also be correctly excluded.

**Additionally** in `getSummary`: Add a `refundedTotal` field to the response so the Reports dashboard can display it.

---

### SQL Aggregation Queries (Critical Fix)

#### [MODIFY] [InvoiceRepository.ts](file:///c:/Users/PotterParker/Desktop/JOECASHIER/src/repositories/InvoiceRepository.ts)

3 methods need a `WHERE status = 'completed'` clause added:

1. **`getTotalSalesByDate()`** (line ~348): Add `AND status = 'completed'`
2. **`getTotalSalesByDateRange()`** (line ~381): Add `AND status = 'completed'`
3. **`getSalesByPricingType()`** (line ~414): Add `AND status = 'completed'`

---

### Refund → Customer Balance (Data Integrity Fix)

#### [MODIFY] [InvoiceRepository.ts](file:///c:/Users/PotterParker/Desktop/JOECASHIER/src/repositories/InvoiceRepository.ts)

In `refund()` method (line ~560): After marking the invoice as refunded, **subtract** the invoice total from the customer's `totalPurchases`.

```ts
// Inside the transaction, after UPDATE invoices:
const invoiceRow = db.prepare('SELECT total_amount, customer_id FROM invoices WHERE id = ?').get(id);
if (invoiceRow.customer_id) {
  db.prepare('UPDATE customers SET total_purchases = MAX(0, total_purchases - ?) WHERE id = ?')
    .run(invoiceRow.total_amount, invoiceRow.customer_id);
}
```

Using `MAX(0, ...)` to prevent negative balances from edge cases.

---

### Report Service Interface (Enhancement)

#### [MODIFY] [ReportService.ts](file:///c:/Users/PotterParker/Desktop/JOECASHIER/src/services/ReportService.ts)

Update `SalesReport` interface to include the new refund metric:

```diff
 export interface SalesReport {
   totalSales: number;
   totalInvoices: number;
   averageInvoiceValue: number;
   wholesaleSales: number;
   retailSales: number;
+  refundedTotal: number;
+  refundedCount: number;
 }
```

---

### Reports Dashboard (UI Enhancement)

#### [MODIFY] [ReportsScreen.tsx](file:///c:/Users/PotterParker/Desktop/JOECASHIER/src/screens/ReportsScreen.tsx)

Add a "Refunds" summary card showing:
- **Refunded Amount**: Total amount refunded in the selected period
- **Refund Count**: Number of refunded invoices

This provides transparency — the user sees both net revenue and refund activity at a glance.

---

## Verification Plan

### Automated
1. **Scenario**: Create an invoice → Refund it → Check that `getSummary` returns correct `totalSales` (should not include refunded amount) and correct `refundedTotal`.
2. **Scenario**: Verify `totalPurchases` on the customer record decreases after refund.

### Manual
1. Open Reports screen → Note `totalSales` → Refund an invoice → Refresh reports → Confirm `totalSales` decreased.
2. Open Customer Management → Verify the refunded customer's total purchases decreased.
