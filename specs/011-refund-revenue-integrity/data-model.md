
# Data Model: Refund Revenue Integrity

## Overview
Status tracking for invoices to support accurate financial reporting and refunds.

## Schema Updates

### Table: `invoices`

| Column | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `status` | `TEXT` | `'completed'` | Tracks invoice lifecycle. Values: `'completed'`, `'voided'`, `'refunded'`. |
| `refund_type` | `TEXT` | `NULL` | Specifies stock handling for refunds. Values: `'defective'`, `'good_condition'`. |

### Logic Constraints

- **Refund Process**:
  - Sets `status = 'refunded'`.
  - Sets `refund_type` based on user selection.
  - Decrements customer `total_purchases` (if applicable).
  - Restores stock only if `refund_type = 'good_condition'`.

- **Reporting Logic**:
  - **Total Sales**: Include only where `status` IS `'completed'` OR `NULL`.
  - **Total Invoices**: Count only `completed` invoices.
  - **Refunded Totals**: Calculate separately where `status = 'refunded'`.

## Migrations
(Already applied in `src/database/connection.ts`)

- Migration 4: Added `status` column.
- Migration 10: Added `refund_type` column.
