# Implementation Plan: Barcode Label Printing Fix (020-barcode-label-fix)

## Technical Context
- **Affected Component**: `src/components/printing/LabelPrintModal.tsx`
- **Root Cause 1**: `showBarcodeText` state is local and resets to `true` on modal mount.
- **Root Cause 2**: Barcode height (15-25px) and width (1.5-2) are too small for thermal printers.
- **Root Cause 3**: CSS `@page` margin is `0`, causing clipping on many thermal printers.
- **Root Cause 4**: Font sizes (8-9px) are too small for low-resolution thermal printing.

## Constitution Check
- **Premium Aesthetics**: Yes - fixing print quality is essential for a premium feel.
- **Design Consistency**: Yes - follows existing component patterns.
- **Performance**: N/A - minimal impact.

## Phase 0: Research & Verification
- [x] Identify barcode dimension best practices for 203 DPI printers.
- [x] Verify `localStorage` usage patterns in the project.

## Phase 1: Implementation
1. **Update `LabelPrintModal.tsx` State**:
   - Initialize `showName`, `showPrice`, and `showBarcodeText` from `localStorage`.
   - Update `localStorage` whenever these states change.
2. **Optimize Barcode Generation**:
   - Increase `width` and `height` in `JsBarcode` options.
   - Recommended: `width: 2`, `height: 40-50` for standard labels.
3. **Enhance Print CSS**:
   - Add `2mm` margin to `@page`.
   - Increase `.product-name` and `.price` font sizes to `10-12px`.
   - Adjust `.barcode-container` to ensure enough vertical space for the larger barcode.

## Phase 2: Verification
- [ ] Open modal and toggle options, verify they persist after closing and reopening.
- [ ] Inspect generated print HTML in the iframe/print dialog.
- [ ] (Manual) User to verify print output on XPrinter.

## Risk Assessment
- **Risk**: Larger barcodes might not fit on 40x20mm labels.
- **Mitigation**: Adjust scaling based on the selected `size`.
