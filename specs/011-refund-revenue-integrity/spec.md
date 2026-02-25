# 011 – Refund Revenue Integrity

## Problem Statement

When an invoice is refunded, the system **only** marks it as `status = 'refunded'` and optionally restores stock. But: 
1. **Revenue is inflated**: Report queries count refunded invoices as real revenue.
2. **Invoice counts are wrong**: Total invoice counts include refunded invoices.
3. **Customer balances are stale**: `customer.totalPurchases` is never decremented on refund.

This makes all financial reports unreliable after any refund.

## Root Cause Analysis

| Layer | File | Bug |
|---|---|---|
| IPC Reports | `electron/ipc/reports.ts` | Filters `!== 'voided'` but **not** `!== 'refunded'` — refunded invoices count as sales |
| SQL Aggregation | `InvoiceRepository.ts` | `getTotalSalesByDate/Range`, `getSalesByPricingType` have **zero** status filtering |
| Customer Data | `InvoiceRepository.refund()` | Never calls `CustomerRepository.updateTotalPurchases()` to subtract amount |

## Requirements

- R1: All revenue queries must exclude `refunded` and `voided` invoices.
- R2: Customer `totalPurchases` must be decremented by the refunded invoice amount.
- R3: Reports dashboard should show refund totals as a separate metric for transparency.
- R4: Daily archive snapshots should reflect net revenue (after refunds).
