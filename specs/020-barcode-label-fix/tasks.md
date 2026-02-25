# Tasks: Barcode Label Printing Fix (020-barcode-label-fix)

## Phase 1: Persistence & UI
- [x] **Task 1: Persist Print Settings**
  - Modify `LabelPrintModal.tsx` to read/write `showName`, `showPrice`, and `showBarcodeText` to `localStorage`.
  - Use keys like `joe-print-label-showName`, etc.

## Phase 2: Print Quality & Scaling
- [x] **Task 2: Optimize Barcode Dimensions**
  - Update `handlePrint` dimensions logic.
  - Scale `width` and `height` in `JsBarcode` based on selected `size`.
  - Ensure `displayValue` reflects the `showBarcodeText` state.

- [x] **Task 3: Responsive Print CSS**
  - Update the style string in `handlePrint`.
  - Change `@page` margin to `2mm`.
  - Increase font sizes for `.product-name` and `.price`.
  - Add centering logic for the barcode SVG.

## Phase 3: Verification
- [x] **Task 4: UI Verification**
  - Verify that settings are remembered correctly.
  - Verify that the print preview (zoomed) looks correct.
