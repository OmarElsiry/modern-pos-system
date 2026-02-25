# Implementation Plan: Product Deletion & Barcode Conflict Fix

**Branch**: `018-product-deletion-fix` | **Date**: 2026-02-12 | **Spec**: [spec.md](file:///c:/Users/PotterParker/Desktop/JOECASHIER/specs/018-product-deletion-fix/spec.md)
**Input**: Feature specification from `/specs/018-product-deletion-fix/spec.md`

## Summary

The current product deletion logic uses a hard delete (`DELETE FROM products`), which fails when a product is referenced in the `invoice_items` table due to foreign key constraints. This results in products appearing to "remain" but being broken, or preventing re-use of barcodes.

We will switch to a **Soft Delete** strategy:
1.  Add an `is_deleted` column to the `products` table.
2.  Update deletion logic to set `is_deleted = 1` and suffix the barcode with `_del_TIMESTAMP` to free the original barcode.
3.  Update search and retrieval logic to exclude deleted products by default.

## Technical Context

**Language/Version**: TypeScript 5.x / React 18+  
**Primary Dependencies**: Electron, better-sqlite3, Tailwind CSS v4  
**Storage**: SQLite  
**Testing**: Manual verification + existing test suites  
**Target Platform**: Windows (Electron Desktop App)  
**Project Type**: Desktop Application (Electron + React)

## Project Structure

### Documentation (this feature)

```text
specs/018-product-deletion-fix/
├── plan.md              # This file
├── spec.md              # Requirements and user stories
└── tasks.md             # To be generated
```

### Source Code

```text
src/
├── database/
│   └── connection.ts    # Migration to add is_deleted column
├── repositories/
│   └── ProductRepository.ts # CRUD logic updates for soft-delete
├── services/
│   └── SalesService.ts  # Verification of product availability
└── screens/
    ├── ProductManagement.tsx # UI reflects repository changes
    └── POSScreen.tsx        # UI reflects repository changes
```

**Structure Decision**: Standard repository pattern update. No new directories or modules are required as we are modifying existing core functionality.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Soft Delete | Database Integrity | Hard delete violates FK constraints on historical sales. |
| Barcode Suffixing | Barcode Re-use | Simply hiding the product doesn't free the UNIQUE constraint on the barcode. |
