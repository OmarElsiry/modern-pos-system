# Data Model: System Transformation

**Feature**: 001-production-audit  
**Date**: 2026-02-07

---

## Entities

### 1. Transaction (Volatile/Session State)

Represents the current active cart state that persists across reloads but is cleared after checkout.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string (UUID)` | Unique transaction identifier |
| `items` | `TransactionItem[]` | List of cart items |
| `customerId` | `string \| null` | Associated customer ID |
| `pricingType` | `'wholesale' \| 'retail'` | Active pricing mode |
| `createdAt` | `ISO DateTime` | When transaction started |
| `updatedAt` | `ISO DateTime` | Last modification time |

**TransactionItem**

| Field | Type | Description |
|-------|------|-------------|
| `productId` | `string` | Product reference |
| `productName` | `string` | Cached product name |
| `quantity` | `number` | Item quantity |
| `unitPrice` | `number` | Price per unit |
| `totalPrice` | `number` | Computed: quantity × unitPrice |

**Persistence**: `localStorage` under key `pos_active_transaction`.

---

### 2. Session (Shift Tracking - Future)

Represents a cashier's work session for reconciliation.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string (UUID)` | Session identifier |
| `userId` | `string` | Cashier user ID |
| `startTime` | `ISO DateTime` | Shift start |
| `endTime` | `ISO DateTime \| null` | Shift end (null if active) |
| `startingCash` | `number` | Opening cash float |
| `endingCash` | `number \| null` | Closing cash (null if active) |
| `status` | `'active' \| 'closed' \| 'reconciled'` | Session state |

**Persistence**: SQLite `sessions` table (to be created).

---

## State Transitions

### Transaction Lifecycle

```
[Empty] → addItem → [Draft] → (add/remove/modify items) → [Draft]
                        ↓
                  completeCheckout
                        ↓
                 [Completed (Invoice)]
                        ↓
                   clearTransaction
                        ↓
                     [Empty]
```

### Session Lifecycle

```
[No Session] → startShift(startingCash) → [Active]
                                             ↓
                               endShift(endingCash)
                                             ↓
                                         [Closed]
                                             ↓
                              reconcile(actualCash)
                                             ↓
                                       [Reconciled]
```

---

## Validation Rules

### Transaction

- `items` array must have at least 1 item before checkout.
- `quantity` must be > 0.
- `unitPrice` must be >= 0.
- `pricingType` must be set before adding items.

### Session

- `startingCash` must be >= 0.
- `endShift` can only be called on `active` session.
- `endingCash` must be provided at shift end.
