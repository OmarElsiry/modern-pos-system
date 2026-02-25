# Tasks: Multi-Logo Support, Layout Optimization & Barcode Fix

## Feature Overview
- **Feature Name**: Multi-Logo Support & Layout Optimization
- **Goal**: Optimize settings layout, add dual-logo support for receipts, and fix aggressive barcode auto-adding.
- **Priority Order**: Barcode Fix (Critical) > Layout Optimization > Multi-Logo Support.

## Phase 1: Setup & Foundations
- [x] T001 Add Migration 14 to include `logo2`, `logo2_position`, and `show_logo2` in `src/database/connection.ts`
- [x] T002 Update `BusinessInfo` interface with new logo fields in `src/types/models.ts`
- [x] T003 [P] Update `getSettings` and `updateSettings` methods in `src/repositories/SettingsRepository.ts`

## Phase 2: [US1] Barcode Scanning Fix (Exact Match)
- **Goal**: Prevent products from being added to the cart based on partial/prefix matches during scanning.
- **Criteria**: Scanning a partial barcode does nothing; only an exact match (with Enter) adds the item.
- [x] T004 Remove aggressive `useEffect` auto-add logic in `src/screens/POSScreen.tsx`

## Phase 3: [US2] Compact Settings Layout
- **Goal**: Condense the "Store Identity" section into a more efficient grid.
- **Criteria**: Store Identity fields use 3 columns instead of full width.
- [x] T005 Refactor "Store Identity" to use a 3-column grid in `src/screens/SettingsScreen.tsx`

## Phase 4: [US3] Multi-Logo Support
- **Goal**: Allow users to upload and position a secondary logo/image for receipts.
- **Criteria**: User can upload two images and see them correctly positioned on a printed receipt.
- [ ] T006 [P] [US3] Add "Secondary Image" upload and toggle controls in `src/screens/SettingsScreen.tsx`
- [x] T007 [P] Update `generateHTMLReceipt` to render dual logos in `src/services/PrintService.ts`
- [x] T008 [P] Implement `getLogoCombinedStyle` helper in `src/services/PrintService.ts`
- [x] T009 [P] Update template rendering logic (if applicable) in `src/services/PrintService.ts`

## Phase 5: Polish & Verification
- [x] T010 [US1] Verify that partial barcode scans no longer auto-add products
- [x] T011 [US3] Verify that both logos appear correctly in POS and on printed receipts
- [x] T012 Run final security scan with `snyk_code_scan`

## Execution Strategy
- Implement the migration and model updates first (T001-T002).
- Fix the barcode bug immediately (T004) to stabilize the POS.
- Refactor the UI in parallel (T005-T007).
- Finalize with printing logic (T008).

## Parallel Execution Opportunities
- T003 (Repository logic) can be done in parallel with T004 (POS fix).
- T006 and T007 (UI controls) can be done in parallel.
