# Implementation Plan: Barcode Label Printing

## 1. Setup
- [ ] Install `jsbarcode`, `react-barcode` (or direct usage of `jsbarcode`). **Direct `jsbarcode` via `useRef` is preferred for control.**
- [ ] Create `spec.md` and `tasks.md` structure.

## 2. Core Logic (Service)
- [ ] **Create `src/services/BarcodeService.ts`**:
  - `generateBarcode(value: string, element: SVGSVGElement, options?: JsBarcode.Options)`: Wrapper for `JsBarcode`.
  - `printLabels(labels: LabelData[])`: Core printing function. Uses `iframe` or `window.open` strategy.
  - Handles CSS `@media print` injection:
    - Page breaks (`page-break-after: always`).
    - Fixed dimensions (e.g., `width: 50mm; height: 30mm`).
    - Removal of headers/footers (`@page { margin: 0; }`).

## 3. UI Components
- [ ] **Create `src/components/printing/BarcodeLabel.tsx`**:
  - Props: `product: Product`, `options: PrintOptions`.
  - Render function: Displays product name, price (formatted), and `<svg>` for barcode.
  - Uses `useEffect` to call `JsBarcode`.

- [ ] **Create `src/components/printing/LabelPrintModal.tsx`**:
  - State: `quantity`, `size`, `showName`, `showPrice`, `showBarcode`.
  - Preview Area: Renders 1x `BarcodeLabel` with current settings.
  - Actions: "Print", "Print All Stock" (optional), "Close".

## 4. Integration
- [ ] **Update `src/screens/products/ProductManagement.tsx`**:
  - Add "Print Label" icon (🖨️ / 🏷️) to row actions.
  - Implement modal trigger logic.

## 5. Testing & Validation
- [ ] Verify barcode scans correctly (using phone app or scanner).
- [ ] Verify print layout on standard A4 and specific thermal sizes via PDF preview.
- [ ] Validate options toggle visibility correctly.

## Dependencies
- `product.barcode` field exists.
- `print` styling requires careful CSS resetting.
