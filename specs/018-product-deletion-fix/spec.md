# Feature Specification: Product Deletion & Barcode Conflict Fix

**Feature Branch**: `018-product-deletion-fix`  
**Created**: 2026-02-12  
**Status**: Draft  
**Input**: User description: "Fixing Product Deletion Bug - deleted products not properly removed, barcode already exists errors."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Graceful Deletion with Sales History (Priority: P1)

As a store owner, I want to be able to delete a product even if it has been sold previously, so that my product list remains clean without breaking historical records.

**Why this priority**: Critical for usability. Currently, deletion fails silently or causes errors when products are linked to invoices.

**Independent Test**: Create a product, sell it in an invoice, then delete it. Verify it disappears from the product management screen but the invoice remains intact and displays the product name correctly.

**Acceptance Scenarios**:

1. **Given** a product with ID "P1" and 10 sales records, **When** I click "Delete", **Then** the product should be marked as deleted and removed from active product lists.
2. **Given** an existing invoice for "P1", **When** I view the invoice history after deleting "P1", **Then** the invoice should still show the product name "P1" and its historical details.

---

### User Story 2 - Barcode Re-usability (Priority: P2)

As a store owner, I want to be able to use a barcode from a deleted product for a new item, so that I can recycle barcodes when stock is discontinued and replaced.

**Why this priority**: Required to fix the "barcode already exists" error reported by the user.

**Independent Test**: Delete a product with barcode "12345", then create a new product with the same barcode "12345". Verify the creation succeeds.

**Acceptance Scenarios**:

1. **Given** a deleted product with barcode "12345", **When** I create a new product with barcode "12345", **Then** the system should allow the creation without a UNIQUE constraint error.

---

### User Story 3 - POS Exclusion (Priority: P3)

As a cashier, I want to ensure that scanning a deleted product barcode doesn't add it to a new invoice, so that I don't accidentally sell discontinued items.

**Why this priority**: Prevents operational errors.

**Independent Test**: Scan the original barcode of a deleted product in the POS screen. Verify the system shows "Product not found" or similar error.

**Acceptance Scenarios**:

1. **Given** a product "P1" that has been deleted, **When** I scan its original barcode in POS, **Then** no item is added to the cart and a warning is shown.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST implement soft-deletion for products using a flag (e.g., `is_deleted`).
- **FR-002**: System MUST modify the barcode of deleted products to free up the original barcode for re-use (e.g., by adding a unique suffix).
- **FR-003**: All product retrieval logic (search, find by ID, find by barcode) MUST by default exclude products marked as deleted.
- **FR-004**: Database migrations MUST be non-destructive to existing data.

### Key Entities

- **Product**:
  - `id`: Primary Key
  - `barcode`: Unique identifier (modified on deletion)
  - `is_deleted`: Boolean flag (new)
- **InvoiceItem**:
  - `productId`: References the Product ID (even if soft-deleted)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: "Barcode already exists" errors are eliminated when re-adding barcodes of recently deleted items.
- **SC-002**: 100% of products with sales history can be successfully "deleted" from the UI.
- **SC-003**: Zero regression in historical invoice reporting.
