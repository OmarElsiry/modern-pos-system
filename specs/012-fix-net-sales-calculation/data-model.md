
# Data Model: Net Sales Calculation

## Schema Reference

### Table: `invoices`

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `TEXT` | Primary Key |
| `total_amount` | `REAL` | Original invoice amount |
| `status` | `TEXT` | Lifecycle status: `'completed'`, `'voided'`, `'refunded'` |
| `refund_type` | `TEXT` | Metadata for refunds |

## Business Logic

### Net Sales Calculation
**Formula**: Sum of `total_amount` where `status` is VALID.

**Valid Statuses**:
- `'completed'`
- `NULL` (Legacy data assumed completed)

**Invalid Statuses (Excluded)**:
- `'voided'` (Cancelled transaction)
- `'refunded'` (Returned transaction)

### Frontend Inteface (`InvoiceWithDetails`)
Matches backend schema.
```typescript
interface InvoiceWithDetails {
  // ...
  totalAmount: number;
  status: 'completed' | 'voided' | 'refunded';
  // ...
}
```
