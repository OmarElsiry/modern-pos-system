# Data Model: Customer Management (Refactor)

**Feature**: 007-customer-mgmt-refactor  
**Date**: 2026-02-10

---

## Entities

### 1. Customer (Existing)

Represents a client in the system. The refactor focuses on the presentation layer, but understands the following structure from `CustomerRepository.ts`.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string (UUID)` | Unique identifier |
| `name` | `string` | Full name |
| `phone` | `string` | Primary contact number |
| `email` | `string \| null` | Email address |
| `address` | `string \| null` | Physical address |
| `createdAt` | `ISO DateTime` | Registration date |
| `updatedAt` | `ISO DateTime` | Last modification |

### 2. PurchaseSummary (UI Derived)

Aggregated data for the Bento stats and history modal.

| Field | Type | Description |
|-------|------|-------------|
| `totalInvoices` | `number` | Total number of purchases |
| `totalSpend` | `number` | Sum of all invoice amounts |
| `lastActivity` | `ISO DateTime` | Date of the latest invoice |
| `preferredPricing` | `'retail' \| 'wholesale'` | Most frequently used pricing mode |

---

## State Transitions

### UI States (View Management)

```
[Listing View] ── clickRow ──→ [Detail/History Modal]
      │
      ├── clickAdd ─────→ [Create Modal]
      │
      ├── clickEdit ────→ [Update Modal]
      │
      └── clickDelete ──→ [Confirmation Dialog]
```

---

## Validation Rules (Frontend)

-   **Name**: Required, minimum 2 characters.
-   **Phone**: Required, must be numeric and follow local format (e.g. 11 digits starting with 01 for Egypt).
-   **Email**: Optional, must follow valid email regex if provided.
-   **Duplicates**: Check via `CustomerService` before submission if name or phone already exists.
