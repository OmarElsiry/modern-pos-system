# Tasks: Command Palette (Trigram)

**Feature**: Command Palette `010-pdf-report-enhancement`
**Total Tasks**: 20

## Phase 1: Setup

- [x] T001 Install `cmdk` package

## Phase 2: Foundational Components

*Blocking tasks for all user stories*

- [x] T002 [P] Create HTML generator service in `src/services/ReportPDFService.ts`
- [x] T003 [P] Create action registry types and file in `src/config/commandActions.ts`
- [x] T004 Create glassmorphic styles in `src/components/CommandPalette.css`
- [x] T005 Create main UI component in `src/components/CommandPalette.tsx`

## Phase 3: Integration

- [x] T006 Update `src/components/Layout.tsx` to mount `CommandPalette` and add hint badge

## Phase 4: User Stories

### Story 1: Navigation Actions (FR-3 Group 1)

### Story 1: Navigation Actions (FR-3 Group 1)
*Goal: Navigate to any screen via keyboard*

- [x] T007 [US1] Update `src/config/commandActions.ts` with Navigation commands

### Story 2: Quick Actions - Products (FR-3 Group 2)
*Goal: Add products or view stock alerts instantly*

- [ ] T008 [P] [US2] Update `src/screens/ProductManagement.tsx` to handle `?action=add` URL param
- [ ] T009 [US2] Update `src/config/commandActions.ts` with Product commands

### Story 3: Quick Actions - Categories (FR-3 Group 3)
*Goal: Add categories instantly*

- [ ] T010 [P] [US3] Update `src/screens/CategoryManagement.tsx` to handle `?action=add` URL param
- [ ] T011 [US3] Update `src/config/commandActions.ts` with Category commands

### Story 4: Quick Actions - Customers (FR-3 Group 4)
*Goal: Add customers instantly*

- [ ] T012 [P] [US4] Update `src/screens/CustomerManagement.tsx` to handle `?action=add` URL param
- [ ] T013 [US4] Update `src/config/commandActions.ts` with Customer commands

### Story 5: PDF Reports (FR-3 Group 5)
*Goal: Generate and save reports from anywhere*

- [ ] T014 [P] [US5] Implement `generateSalesReportHTML` in `src/services/ReportPDFService.ts`
- [ ] T015 [P] [US5] Implement `generateInventoryReportHTML` in `src/services/ReportPDFService.ts`
- [ ] T016 [P] [US5] Implement `generateCustomerListHTML` in `src/services/ReportPDFService.ts`
- [ ] T017 [US5] Update `src/config/commandActions.ts` with PDF commands

### Story 6: System Actions (FR-3 Group 6)
*Goal: Control app state (fullscreen, archive)*

- [ ] T018 [US6] Update `src/config/commandActions.ts` with System commands

## Phase 5: Polish & Verification

- [ ] T019 Run `npm run lint` and fix any issues
- [ ] T020 Verify all commands in the palette manually across all screens

## Dependencies

1. **Phase 1 & 2** must constitute the "Skeleton" release.
2. **Phase 3** enables the UI.
3. **Phases 4-6** can be parallelized by feature vertical.

## Parallel Execution Opportunities

- T002, T003, T004 (Foundational) can be built in parallel.
- T008, T010, T012 (Screen updates) are independent.
- T014, T015, T016 (PDF generators) are independent.
