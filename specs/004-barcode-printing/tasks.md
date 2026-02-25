# Tasks: Barcode Label Printing

**Feature Branch**: `004-barcode-printing`
**Input**: Design documents from `/specs/004-barcode-printing/`

## Phase 1: Setup & Libraries

- [x] T001 Install `jsbarcode`, `react-barcode` (or confirm direct usage of `jsbarcode`).
- [x] T002 Update `src/index.css` or new stylesheet for print styles (`@page` rules).

## Phase 2: Core Components

- [x] T003 Create `BarcodeLabel.tsx` component (renders barcode via SVG).
      - Props: `value`, `width`, `height`, `format` (default: CODE128).
- [x] T004 Create `LabelPrintModal.tsx` component.
      - State: `quantity`, `showName`, `showPrice`, `labelSize`.
      - Render: Preview area + Controls.
- [x] T005 Implement `printLabels` logic inside modal or separate service.
      - Generates an iframe or proper print window content.
      - Injects styles for 50x30mm or selected size.

## Phase 3: Integration

- [x] T006 Update `ProductManagement.tsx` to include "Print Label" action icon.
- [x] T007 Connect action to open `LabelPrintModal` with selected product.

## Phase 4: Validation & Polish

- [x] T008 Verify printed output dimensions match thermal printers.
- [x] T009 Ensure barcode scans correctly (manual verification with phone app).
- [x] T010 Polish UI (Modal design, success toast).

## Checkpoints

- **Checkpoint 1**: T001-T002 Setup complete.
- **Checkpoint 2**: T003-T005 Printing logic working.
- **Checkpoint 3**: Feature integrated and tested.
