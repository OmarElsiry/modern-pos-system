# Tasks: Product Deletion & Barcode Conflict Fix

**Input**: Design documents from `/specs/018-product-deletion-fix/`
**Prerequisites**: plan.md (required), spec.md (required)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Initialize feature documentation in specs/018-product-deletion-fix/
- [x] T002 Sync implementation plan with brain/ artifacts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Database Migration: Add is_deleted column to products table
- [x] T004 Update Product interface in models.ts
- [x] T005 Update findAll to filter WHERE is_deleted = 0
- [x] T006 Update findById to filter WHERE is_deleted = 0
- [x] T007 Update findByBarcode to filter WHERE is_deleted = 0

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Graceful Deletion (Priority: P1) 🎯 MVP

**Goal**: Allow deleting products referenced in sales history without database errors.

**Independent Test**: Delete a product with sales history and verify it disappears from UI without error.

### Implementation for User Story 1

- [ ] T008 Update `ProductRepository.delete` to perform soft-delete (`UPDATE is_deleted = 1`) in src/repositories/ProductRepository.ts
- [ ] T009 [P] Update `ProductManagement.tsx` delete handler to handle soft-deletion success/failure in src/screens/ProductManagement.tsx

**Checkpoint**: User Story 1 functional - products with history can now be "deleted".

---

## Phase 4: User Story 2 - Barcode Re-usability (Priority: P2)

**Goal**: Allow recycled use of barcodes from deleted products.

**Independent Test**: Delete a product, then create a new one with the same barcode.

### Implementation for User Story 2

- [ ] T010 Update `ProductRepository.delete` to suffix deleted barcodes (e.g., `barcode || '_del_' || timestamp`) in src/repositories/ProductRepository.ts
- [ ] T011 Verify `ProductRepository.create` handles barcode uniqueness against only active products or suffixed ones in src/repositories/ProductRepository.ts

**Checkpoint**: User Story 2 functional - barcodes are now reusable after deletion.

---

## Phase 5: User Story 3 - POS Exclusion (Priority: P3)

**Goal**: Prevent scanning or adding deleted products to new invoices in the POS screen.

**Independent Test**: Scan a deleted product's original barcode in POS and verify it's not found.

### Implementation for User Story 3

- [ ] T012 Update `SalesService.addProductToInvoice` to check for `is_deleted` status in src/services/SalesService.ts
- [ ] T013 Update `POSScreen.tsx` to handle "Product not found" specifically for deleted items in src/screens/POSScreen.tsx

**Checkpoint**: All user stories functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T014 Run manual verification checklist from spec.md
- [ ] T015 Verify historical reports (Sales/Invoices) still display product names correctly
- [ ] T016 Perform Snyk code scan on modified files

---

## Dependencies & Execution Order

### Phase Dependencies
- **Foundational (Phase 2)**: BLOCKS all user stories.
- **User Stories**: US1 is the priority. US2 depends on US1's soft-delete logic. US3 is independent but depends on Phase 2.

### Parallel Opportunities
- T004 can run with T003.
- US1 and US2 implementation are tightly coupled in the same repository file, so they should be sequential.
- US3 can be worked on after Phase 2 is complete.
