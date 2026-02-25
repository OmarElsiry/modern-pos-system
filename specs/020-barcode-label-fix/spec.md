# Feature Specification: Barcode Label Printing Fix (020-barcode-label-fix)

## Overview
Users are experiencing issues when printing barcode labels using XPrinter thermal printers. The printed labels are either empty or contain only a small line. Additionally, the "رقم الباركود" (Barcode Number) toggle in the printing modal does not persist its state, defaulting to "on" every time the modal is opened.

## Functional Requirements
1. **Persistence**: The state of the "رقم الباركود" toggle should be saved across sessions (e.g., in `localStorage`).
2. **Quality**: Barcodes must be clearly printed on XPrinter thermal printers without clipping or empty outputs.
3. **Visibility**: Labels must include the product name, price, and barcode clearly when enabled.

## Technical Requirements
1. **Barcode Dimensions**: Increase barcode height and width to meet thermal printer requirements (203 DPI standard).
2. **Print Margins**: Implement consistent 2mm-3mm margins in the print CSS to prevent clipping by the printer head.
3. **Typography**: Increase font sizes for better readability on thermal paper.
4. **State Management**: Use `localStorage` to persist UI toggles in `LabelPrintModal.tsx`.

## Technical Context
- **Component**: `src/components/printing/LabelPrintModal.tsx`
- **Library**: `jsbarcode` for SVG generation.
- **Hardware**: XPrinter (Generic Thermal ESC/POS or Label Printer).
- **Resolution**: Typically 203 DPI.

## Implementation Traceability
| ID | Description | Location |
|----|-------------|----------|
| TR-01 | Persist UI toggles | `LabelPrintModal.tsx` |
| TR-02 | Optimize Barcode dimensions | `JsBarcode` call in `LabelPrintModal.tsx` |
| TR-03 | Add print margins and font scaling | `@page` and CSS in `LabelPrintModal.tsx` |
