# Tasks: One-Click Printing & Test Coverage

- **Total Tasks**: 16
- **Current Phase**: Phase 3 (US1)

## Dependencies

1. **US1 (POS Printing)** -> Independent
2. **US2 (History Printing)** -> Independent
3. **US3 (Label Printing)** -> Independent
4. **US4 (Reports)** -> Independent
5. **US5 (Invoice Design)** -> Depends on Invoice Designer feature (completed)

## Implementation Strategy

We will execute these verification tasks manually or using browser emulation. Deviations will be logged as new bug tasks.

---

### Phase 1: Setup
*Prerequisites and environment checks*

- [x] T001 Verify local dev environment is running with `npm run dev:electron`

### Phase 2: Foundational
*Core printing utilities check*

- [x] T002 Verify `PrintService.ts` has no external font dependencies (offline check)
- [x] T002a Update `SystemSettings` schema in `src/types/models.ts`
- [x] T002b Implement `autoPrint` toggle in `src/screens/SettingsScreen.tsx`
- [x] T002c Implement `autoPrint` check in `src/screens/POSScreen.tsx`

### Phase 3: POS Printing (User Story 1)
*Goal: As a cashier, I need receipts to print correctly after every sale.*

- [ ] T003 [US1] Configure `autoPrint: true` and verify print dialog appears on sale completion in `src/screens/POSScreen.tsx`
- [ ] T004 [US1] Configure `autoPrint: false` and verify NO dialog appears on sale completion in `src/screens/POSScreen.tsx`
- [ ] T005 [US1] Verify manual "Print Invoice" button works in Success Modal in `src/screens/POSScreen.tsx`
- [ ] T006 [US1] Verify printed receipt contains correct Business Info and RTL layout

### Phase 4: Invoice History (User Story 2)
*Goal: As a manager, I need to reprint past invoices accurately.*

- [ ] T007 [US2] Verify "Print Invoice" action in `InvoiceHistory` details view renders A4 layout correcty
- [ ] T008 [US2] Verify "Print List" action in `InvoiceHistory` header prints the current filtered table

### Phase 5: Label Printing (User Story 3)
*Goal: As a manager, I need product labels to print with correct barcodes.*

- [ ] T009 [US3] Open Label Print Modal in `src/components/printing/LabelPrintModal.tsx` and verify toggles (Name, Price, Barcode) work
- [ ] T010 [US3] Verify 38x25mm label size layout and scanner readability
- [ ] T011 [US3] Verify 50x30mm label size layout and text alignment

### Phase 6: Reports (User Story 4)
*Goal: As a manager, I need reports to print in a readable format.*

- [ ] T012 [US4] check if "Print" button exists in `src/screens/ReportsScreen.tsx` or identify if missing functionality
- [ ] T013 [US4] If missing, log task to add specific Print button for Reports (Decision needed)

### Phase 7: Invoice Design (User Story 5)
*Goal: As a user, I need custom invoice designs to be reflected in printed output.*

- [ ] T014 [US5] Apply a custom design in Invoice Designer and verify it reflects in POS receipt print
- [ ] T015 [US5] Verify custom elements (e.g. logo, custom text) appear on printed receipt

### Phase 8: Polish
*Visual consistency checks*

- [ ] T016 Verify "Glassy White" UI design of Receipt Preview Modal matches `src/components/ReceiptPreview.css`
