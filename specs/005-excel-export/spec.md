# Specification: Export to Excel

## 1. Overview
The "Export to Excel" feature provides users with a standardized way to extract data from the system (Products, Sales, Customers) into Microsoft Excel (.xlsx) format. This is vital for bookkeeping, external inventory audits, and offline data analysis.

## 2. User Stories
- **US1**: As a store owner, I want to export my entire product list so I can perform a manual inventory count.
- **US2**: As an accountant, I want to export sales reports for a specific date range to calculate taxes and profit.
- **US3**: As a manager, I want to export the customer list to use for external marketing or loyalty tracking.

## 3. Technical Requirements

### 3.1 Library
- **xlsx**: For generating Excel workbooks and sheets.

### 3.2 Feature Scope
- **Product Export**: Name, Barcode, Category, Prices, Stock levels.
- **Invoice Export**: Invoice Number, Date, Customer, Total, Payment Method, Status.
- **General Utility**: A reusable `ExcelService` to handle data transformation and file saving.

### 3.3 UI Implementation
- **Product Screen**: "Export Inventory" button in the control bar.
- **Reports/Invoices**: "Export Results" button next to filters.

## 4. Design Aesthetics
- Use a **FileSpreadsheet** icon from `lucide-react`.
- Success notification (toast) after the file is generated.
- Automatic filename generation using timestamps (e.g., `inventory_export_2026_02_10.xlsx`).

---

# Tasks: Export to Excel

## Phase 1: Setup
- [x] T001 Install `xlsx`.
- [x] T002 Create `src/services/ExportService.ts`.

## Phase 2: Implementation
- [x] T003 Implement `exportToExcel(data, fileName, sheetName)` in `ExportService`.
- [x] T004 Create specific mappers to format raw database objects for human-readable Excel (e.g., camelCase to Title Case headers).

## Phase 3: UI Integration
- [x] T005 Add Export button to `ProductManagement`.
- [x] T006 Add Export button to `InvoiceHistory` (or Reports).

## Phase 4: Validation
- [x] T007 Verify file opens correctly in Excel/Google Sheets.
- [x] T008 Check that date formats are readable.
- [x] T009 Verify numeric values are treated as numbers in Excel (for summing).
